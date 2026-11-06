import { z } from "zod";

/**
 * Remove whitespace, dots, hyphens, and parenthesis commonly used in phone numbers
 */
export function normalizePhone(phone: string): string {
  if (typeof phone !== "string") return "";
  return phone.replace(/[\s.\-()]/g, "");
}

/**
 * Standard Vietnamese mobile phone number format:
 * Accepts numbers starting with 0, +84, or 84, followed by 3, 5, 7, 8, 9 and 8 digits (10 digits in total).
 */
export const VIETNAM_PHONE_REGEX = /^(?:\+84|84|0)[35789]\d{8}$/;

/**
 * Strip HTML tags and unsafe characters to sanitize text before processing
 */
export function sanitizeText(input: unknown): string {
  if (typeof input !== "string") return "";
  return input
    .replace(/<[^>]*>?/gm, "") // remove HTML tags
    .replace(/[<>]/g, "")      // remove standalone angle brackets
    .trim();
}

/**
 * Zod validation schema for contact & quote requests
 */
export const contactSchema = z
  .object({
    name: z
      .string()
      .min(1, "Vui lòng nhập họ và tên")
      .min(2, "Họ và tên phải có ít nhất 2 ký tự")
      .max(100, "Họ và tên không được vượt quá 100 ký tự")
      .transform(sanitizeText),

    phone: z
      .string()
      .min(1, "Vui lòng nhập số điện thoại")
      .transform(normalizePhone)
      .refine((val) => VIETNAM_PHONE_REGEX.test(val), {
        message: "Số điện thoại không hợp lệ (VD: 0987654321 hoặc 0834.204.999)",
      }),

    email: z
      .string()
      .optional()
      .or(z.literal(""))
      .transform((val) => (val ? sanitizeText(val) : ""))
      .refine(
        (val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
        {
          message: "Địa chỉ email không đúng định dạng",
        }
      ),

    message: z
      .string()
      .optional()
      .or(z.literal(""))
      .transform((val) => (val ? sanitizeText(val) : ""))
      .refine((val) => !val || val.length <= 1000, {
        message: "Nội dung không được vượt quá 1000 ký tự",
      }),

    source: z
      .string()
      .optional()
      .or(z.literal(""))
      .transform((val) => (val ? sanitizeText(val) : "")),

    note: z
      .string()
      .optional()
      .or(z.literal(""))
      .transform((val) => (val ? sanitizeText(val) : "")),

    // Honeypot field - must be empty to block automated bot submissions
    website: z
      .string()
      .optional()
      .or(z.literal("")),

    // Cloudflare Turnstile token
    "cf-turnstile-response": z.string().optional(),
    turnstileToken: z.string().optional(),
  })
  .refine(
    (data) => {
      const token = data["cf-turnstile-response"] || data.turnstileToken;
      return typeof token === "string" && token.trim().length > 0;
    },
    {
      message: "Vui lòng xác minh bảo mật Cloudflare Turnstile trước khi gửi",
      path: ["turnstileToken"],
    }
  );

export type ContactFormData = z.infer<typeof contactSchema>;

/**
 * Sanitized data ready for database persistence and email notification
 */
export interface SanitizedContactData {
  name: string;
  phone: string;
  email: string;
  message: string;
  source: string;
  note: string;
  turnstileToken: string;
}

/**
 * Sanitize and extract clean contact input
 */
export function extractSanitizedContact(data: Record<string, any>): SanitizedContactData {
  const token = data["cf-turnstile-response"] || data.turnstileToken || "";
  return {
    name: sanitizeText(data.name || ""),
    phone: normalizePhone(String(data.phone || "")),
    email: sanitizeText(data.email || ""),
    message: sanitizeText(data.message || ""),
    source: sanitizeText(data.source || ""),
    note: sanitizeText(data.note || ""),
    turnstileToken: String(token).trim(),
  };
}
