import db from '../../../utils/db';
import Feedback from '../../../models/Feedback';
import { requireAdmin } from '../../../lib/adminAuth';

const VALID_INDUSTRIES = ["Gym", "Yoga", "Pickleball", "Fitness", "MMA", "Running", "Golf", "Tennis", ""];

function sanitizeSlug(slug) {
  if (!slug) return '';
  return slug
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function cleanFeedbackData(data) {
  const cleaned = { ...data };
  delete cleaned.id;
  delete cleaned._id;
  delete cleaned.createdAt;
  delete cleaned.updatedAt;

  if (cleaned.slug) {
    cleaned.slug = sanitizeSlug(cleaned.slug);
  } else if (cleaned.title) {
    cleaned.slug = sanitizeSlug(cleaned.title);
  }

  if (Array.isArray(cleaned.gallery)) {
    cleaned.gallery = cleaned.gallery
      .filter((img) => img && typeof img.src === 'string' && img.src.trim())
      .map((img) => ({
        src: img.src.trim(),
        aspectRatio: img.aspectRatio || 'landscape-3-4',
        width: Number(img.width) || 4,
        height: Number(img.height) || 3,
      }));
  }

  if (cleaned.rating !== undefined) {
    const r = Number(cleaned.rating);
    cleaned.rating = isNaN(r) ? 5 : Math.max(0, Math.min(5, r));
  }

  if (cleaned.productLines !== undefined) {
    const p = Number(cleaned.productLines);
    cleaned.productLines = isNaN(p) ? 0 : Math.max(0, p);
  }

  if (cleaned.year !== undefined) {
    const y = Number(cleaned.year);
    cleaned.year = isNaN(y) ? new Date().getFullYear() : y;
  }

  if (cleaned.industry && !VALID_INDUSTRIES.includes(cleaned.industry)) {
    cleaned.industry = "";
  }

  return cleaned;
}

export default async function handler(req, res) {
  const { method } = req;

  if (method !== 'GET') {
    if (!(await requireAdmin(req, res))) return;
  }

  await db.connectDb();

  try {
    switch (method) {
      case 'GET': {
        const limit = req.query.limit ? parseInt(req.query.limit) : 1000;
        const filter = {};
        if (req.query.category) {
          filter.category = req.query.category;
        }
        const feedbacks = await Feedback.find(filter).sort({ createdAt: -1 }).limit(limit);
        return res.status(200).json({ success: true, data: { projects: feedbacks } });
      }

      case 'POST': {
        const payload = cleanFeedbackData(req.body);
        if (!payload.title || !payload.customer) {
          return res.status(400).json({
            success: false,
            message: 'Tiêu đề và Tên khách hàng là bắt buộc.',
          });
        }

        if (payload.slug) {
          const existingSlug = await Feedback.findOne({ slug: payload.slug });
          if (existingSlug) {
            return res.status(400).json({
              success: false,
              message: `Slug "${payload.slug}" đã tồn tại. Vui lòng chọn tiêu đề khác.`,
            });
          }
        }

        const newFeedback = new Feedback(payload);
        await newFeedback.save();
        return res.status(201).json({ success: true, data: newFeedback });
      }

      case 'PUT': {
        const id = req.body.id || req.body._id;
        if (!id) {
          return res.status(400).json({
            success: false,
            message: 'Thiếu ID Feedback để cập nhật.',
          });
        }

        const updateData = cleanFeedbackData(req.body);

        if (updateData.slug) {
          const existingSlug = await Feedback.findOne({
            slug: updateData.slug,
            _id: { $ne: id },
          });
          if (existingSlug) {
            return res.status(400).json({
              success: false,
              message: `Slug "${updateData.slug}" đã được sử dụng bởi một Feedback khác. Vui lòng đổi tiêu đề hoặc đường dẫn khác.`,
            });
          }
        }

        const updatedFeedback = await Feedback.findByIdAndUpdate(
          id,
          { $set: updateData },
          { new: true, runValidators: true }
        );

        if (!updatedFeedback) {
          return res.status(404).json({
            success: false,
            message: 'Không tìm thấy Feedback để cập nhật.',
          });
        }

        return res.status(200).json({ success: true, data: updatedFeedback });
      }

      case 'DELETE': {
        const { id } = req.query;
        if (!id) {
          return res.status(400).json({
            success: false,
            message: 'Thiếu ID Feedback để xóa.',
          });
        }

        const deleted = await Feedback.findByIdAndDelete(id);
        if (!deleted) {
          return res.status(404).json({
            success: false,
            message: 'Không tìm thấy Feedback để xóa.',
          });
        }

        return res.status(200).json({
          success: true,
          message: 'Xóa Feedback thành công.',
        });
      }

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).end(`Phương thức ${method} không được hỗ trợ`);
    }
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Slug đã tồn tại. Vui lòng chọn tiêu đề khác.',
      });
    }
    console.error('API Feedback Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Lỗi máy chủ',
    });
  }
}
