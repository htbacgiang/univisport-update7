// pages/api/contact.js
import db from "../../../utils/db";
import Contact from '../../../models/Contact';
import { requireAdmin } from "../../../lib/adminAuth";
import { checkRateLimit } from "../../../lib/rateLimit";
import { processContactSubmission } from "../../../app/actions/contact";


let clients = [];

export default async function handler(req, res) {
  await db.connectDb();

  const { method, query, body } = req;

  // Xử lý Server-Sent Events
  if (req.url === '/api/contact/stream') {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const clientId = Date.now();
    const newClient = { id: clientId, res };
    clients.push(newClient);

    req.on('close', () => {
      clients = clients.filter((client) => client.id !== clientId);
    });

    return;
  }

  switch (method) {
    case 'GET': {
      if (!(await requireAdmin(req, res))) return;
      try {
        const page = parseInt(query.page) || 1;
        const limit = parseInt(query.limit) || 10;
        const skip = (page - 1) * limit;

        const contacts = await Contact.find({})
          .sort({ createdAt: -1 }) // Thay submittedAt bằng createdAt nếu dùng schema trước đó
          .skip(skip)
          .limit(limit);
        const total = await Contact.countDocuments();

        return res.status(200).json({
          success: true,
          message: 'Danh sách thông tin liên hệ',
          data: contacts,
          total,
        });
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: 'Lỗi server: ' + error.message,
        });
      }
    }
    case 'POST': {
      if (!checkRateLimit(req, res, { limit: 5, windowMs: 15 * 60 * 1000 })) return;

      try {
        const clientIp =
          (typeof req.headers['x-forwarded-for'] === 'string'
            ? req.headers['x-forwarded-for'].split(',')[0].trim()
            : undefined) ||
          req.socket?.remoteAddress;

        const result = await processContactSubmission(body, clientIp);

        if (!result.success) {
          return res.status(400).json({
            success: false,
            message: result.message,
            errors: result.errors,
          });
        }

        // Gửi sự kiện SSE nếu có admin client đang nghe
        if (clients.length > 0 && result.data) {
          const eventData = {
            type: 'new_contact',
            contact: {
              name: result.data.name,
              createdAt: result.data.createdAt,
            },
          };
          clients.forEach((client) =>
            client.res.write(`data: ${JSON.stringify(eventData)}\n\n`)
          );
        }

        return res.status(201).json({
          success: true,
          message: result.message,
          data: result.data,
        });
      } catch (error) {
        console.error('Lỗi khi xử lý yêu cầu contact:', error);
        return res.status(500).json({
          success: false,
          message: 'Lỗi máy chủ khi xử lý yêu cầu liên hệ: ' + error.message,
        });
      }
    }
    case 'DELETE': {
      if (!(await requireAdmin(req, res))) return;
      const { id } = query;
      try {
        const deletedContact = await Contact.findByIdAndDelete(id);
        if (!deletedContact) {
          return res.status(404).json({
            success: false,
            message: 'Không tìm thấy thông tin liên hệ',
          });
        }
        return res.status(200).json({
          success: true,
          message: 'Xóa thông tin thành công',
        });
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: 'Lỗi khi xóa: ' + error.message,
        });
      }
    }
    default:
      res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
      return res.status(405).json({
        success: false,
        message: `Method ${method} Not Allowed`,
      });
  }
}