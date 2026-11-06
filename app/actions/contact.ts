"use server";

import db from "../../utils/db";
import Contact from "../../models/Contact";
import nodemailer from "nodemailer";
import {
  contactSchema,
  extractSanitizedContact,
  ContactFormData,
} from "../../lib/validations/contact";
import { verifyTurnstileToken } from "../../lib/turnstile";

export interface ContactActionResult {
  success: boolean;
  message: string;
  errors?: Record<string, string>;
  data?: any;
}

/**
 * Helper to create nodemailer transporter using Gmail App Password
 */
async function createTransporter() {
  const senderEmail = process.env.SENDER_EMAIL_ADDRESS || process.env.EMAIL_USER;
  const appPassword = process.env.EMAIL_APP_PASSWORD || process.env.EMAIL_PASS;

  if (!senderEmail || !appPassword) {
    throw new Error(
      "Missing email configuration. Please check SENDER_EMAIL_ADDRESS and EMAIL_APP_PASSWORD in environment."
    );
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: senderEmail,
      pass: appPassword,
    },
  });
}

/**
 * Core processing logic for contact/quote submissions
 */
export async function processContactSubmission(
  rawData: any,
  remoteIp?: string
): Promise<ContactActionResult> {
  try {
    // 1. Honeypot check: If the hidden 'website' field has any content, silently block or reject as bot
    if (rawData && typeof rawData === "object" && rawData.website) {
      console.warn("Honeypot field triggered. Suspected bot submission detected.");
      return {
        success: false,
        message: "Phát hiện hành vi gửi biểu mẫu bất thường (Bot). Yêu cầu đã bị từ chối.",
      };
    }

    // 2. Validate input fields using Zod schema
    const validationResult = contactSchema.safeParse(rawData);
    if (!validationResult.success) {
      const fieldErrors: Record<string, string> = {};
      const issues = validationResult.error.issues;
      issues.forEach((issue) => {
        const path = issue.path[0] ? String(issue.path[0]) : "form";
        if (!fieldErrors[path]) {
          fieldErrors[path] = issue.message;
        }
      });

      const firstMessage = issues[0]?.message || "Dữ liệu nhập vào không hợp lệ.";
      return {
        success: false,
        message: firstMessage,
        errors: fieldErrors,
      };
    }

    // 3. Extract sanitized data
    const sanitized = extractSanitizedContact(rawData);

    // 4. Verify Cloudflare Turnstile token
    const turnstileResult = await verifyTurnstileToken(
      sanitized.turnstileToken,
      remoteIp
    );

    if (!turnstileResult.success) {
      return {
        success: false,
        message:
          turnstileResult.error ||
          "Xác minh bảo mật Cloudflare Turnstile thất bại. Vui lòng thử lại.",
        errors: {
          turnstileToken:
            turnstileResult.error ||
            "Mã bảo mật không hợp lệ hoặc đã hết hạn.",
        },
      };
    }

    // 5. Connect to Database and persist Contact document
    await db.connectDb();

    const newContact = new Contact({
      name: sanitized.name,
      email: sanitized.email || undefined,
      phone: sanitized.phone,
      message: sanitized.message || undefined,
      note: sanitized.note || undefined,
      source: sanitized.source || "Website (Popup báo giá)",
      createdAt: new Date(),
    });

    await newContact.save();

    // 6. Send notification email to Admin(s)
    try {
      const transporter = await createTransporter();

      const adminEmails = [
        process.env.ADMIN_EMAIL || process.env.SENDER_EMAIL_ADDRESS,
        process.env.ADMIN_EMAIL_2,
        process.env.ADMIN_EMAIL_3,
      ].filter(Boolean) as string[];

      if (adminEmails.length > 0) {
        const adminMailOptions = {
          from: process.env.SENDER_EMAIL_ADDRESS || process.env.EMAIL_USER,
          to: adminEmails.join(", "),
          subject: "🔔 Thông báo: Yêu cầu tư vấn & báo giá mới từ website Univi",
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <style>
                .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
                .header { background: linear-gradient(135deg, #105d97 0%, #0d4a7a 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f8f9fa; padding: 25px; border-radius: 0 0 10px 10px; }
                .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.06); }
                .info-item { margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee; }
                .info-item:last-child { border-bottom: none; }
                .label { font-weight: bold; color: #333; display: inline-block; width: 140px; }
                .value { color: #555; }
                .badge { display: inline-block; padding: 4px 10px; background: #e6f4ea; color: #137333; border-radius: 12px; font-size: 12px; font-weight: bold; }
                .footer { text-align: center; margin-top: 20px; color: #888; font-size: 13px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h2 style="margin: 0;">📧 Yêu Cầu Tư Vấn & Báo Giá Mới</h2>
                  <p style="margin: 5px 0 0; font-size: 14px;">Từ website Đồng Phục UniVi</p>
                </div>
                <div class="content">
                  <p>Xin chào Admin,</p>
                  <p>Khách hàng vừa gửi thông tin liên hệ đặt hàng & báo giá từ website qua form đã được xác thực Cloudflare Turnstile:</p>
                  
                  <div class="info-box">
                    <h3 style="color: #105d97; margin-top: 0;">📝 Thông tin khách hàng:</h3>
                    <div class="info-item">
                      <span class="label">👤 Họ và tên:</span>
                      <span class="value"><strong>${sanitized.name}</strong></span>
                    </div>
                    <div class="info-item">
                      <span class="label">📱 Số điện thoại:</span>
                      <span class="value"><a href="tel:${sanitized.phone}">${sanitized.phone}</a></span>
                    </div>
                    ${
                      sanitized.email
                        ? `
                    <div class="info-item">
                      <span class="label">📧 Email:</span>
                      <span class="value"><a href="mailto:${sanitized.email}">${sanitized.email}</a></span>
                    </div>`
                        : ""
                    }
                    <div class="info-item">
                      <span class="label">💬 Nội dung yêu cầu:</span>
                      <span class="value">${sanitized.message || "Không có yêu cầu chi tiết"}</span>
                    </div>
                    ${
                      sanitized.source
                        ? `
                    <div class="info-item">
                      <span class="label">📍 Nguồn gửi:</span>
                      <span class="value">${sanitized.source}</span>
                    </div>`
                        : ""
                    }
                    <div class="info-item">
                      <span class="label">🛡️ Bảo mật:</span>
                      <span class="value"><span class="badge">Đã xác minh Cloudflare Turnstile</span></span>
                    </div>
                    <div class="info-item">
                      <span class="label">⏰ Thời gian:</span>
                      <span class="value">${new Date().toLocaleString("vi-VN", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}</span>
                    </div>
                  </div>
                  
                  <div style="background: #e8f4fd; padding: 14px; border-radius: 8px; border-left: 4px solid #105d97;">
                    <p style="margin: 0; color: #0d4a7a; font-size: 13px;">
                      <strong>📞 Nhắc nhở:</strong> Vui lòng liên hệ lại với khách hàng trong vòng 15-30 phút để hỗ trợ tư vấn và gửi báo giá kịp thời.
                    </p>
                  </div>
                  
                  <div class="footer">
                    <p>Email thông báo tự động từ hệ thống website Đồng Phục Univi.<br>
                    <strong>Website:</strong> dongphucunivi.com</p>
                  </div>
                </div>
              </div>
            </body>
            </html>
          `,
        };

        await transporter.sendMail(adminMailOptions);
      }
    } catch (mailError: any) {
      console.error("Lỗi khi gửi email thông báo admin:", mailError);
      // Tiếp tục thành công vì bản ghi DB đã được lưu an toàn
    }

    return {
      success: true,
      message: "Gửi yêu cầu thành công! Chúng tôi sẽ liên hệ lại sớm nhất.",
      data: {
        id: newContact._id ? String(newContact._id) : undefined,
        name: newContact.name,
        createdAt: newContact.createdAt,
      },
    };
  } catch (error: any) {
    console.error("Error processing contact submission:", error);
    return {
      success: false,
      message: "Lỗi hệ thống khi xử lý yêu cầu: " + (error.message || "Vui lòng thử lại sau."),
    };
  }
}

/**
 * Server Action callable from client forms or Next.js App Router
 */
export async function submitContactAction(
  formData: FormData | Record<string, any>
): Promise<ContactActionResult> {
  const rawData: Record<string, any> = {};

  if (formData instanceof FormData) {
    formData.forEach((value, key) => {
      rawData[key] = value;
    });
  } else if (typeof formData === "object" && formData !== null) {
    Object.assign(rawData, formData);
  }

  return processContactSubmission(rawData);
}
