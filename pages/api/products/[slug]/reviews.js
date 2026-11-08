import mongoose from "mongoose";
import db from "../../../../utils/db";
import Product from "../../../../models/Product";
import { requireAdmin } from "../../../../lib/adminAuth";
import { verifyTurnstileToken } from "../../../../lib/turnstile";

/**
 * API đánh giá sản phẩm (Sprint 0.5.1A – bảo mật & kiểm duyệt).
 *
 * GET    công khai — chỉ trả review ĐÃ DUYỆT (approved === true), chỉ các trường cần hiển thị.
 * POST   công khai — bắt buộc Cloudflare Turnstile + rate limit; review mới luôn approved=false.
 * DELETE chỉ admin (requireAdmin → 403).
 * Duyệt / bỏ duyệt: PATCH /api/admin/reviews (chỉ admin).
 */

// ── Rate limit (bộ nhớ tiến trình) ────────────────────────────────────────────
// Lưu ý: chỉ hiệu lực trong 1 tiến trình Node. Turnstile là lớp chặn chính.
const PER_PRODUCT_LIMIT = 2; // tối đa 2 review / IP / sản phẩm / 24h
const PER_PRODUCT_WINDOW_MS = 24 * 60 * 60 * 1000;
const GLOBAL_LIMIT = 5; // tối đa 5 review / IP / giờ (mọi sản phẩm)
const GLOBAL_WINDOW_MS = 60 * 60 * 1000;
const ATTEMPT_LIMIT = 20; // tối đa 20 lần thử POST / IP / 10 phút (kể cả token sai)
const ATTEMPT_WINDOW_MS = 10 * 60 * 1000;
const hits = new Map(); // key -> { count, resetAt }

function getClientIp(req) {
  // Sau Cloudflare: cf-connecting-ip là IP thật, client không giả mạo được.
  // KHÔNG dùng phần tử đầu của x-forwarded-for (client tự đặt được).
  const cf = req.headers["cf-connecting-ip"];
  if (cf) return String(cf).trim();
  const real = req.headers["x-real-ip"];
  if (real) return String(real).trim();
  return req.socket?.remoteAddress || "unknown";
}

function consume(key, limit, windowMs) {
  const now = Date.now();
  if (hits.size > 10000) {
    for (const [k, v] of hits) if (v.resetAt < now) hits.delete(k);
  }
  const rec = hits.get(key);
  if (!rec || rec.resetAt < now) {
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }
  if (rec.count >= limit) return { ok: false, retryAfter: Math.ceil((rec.resetAt - now) / 1000) };
  rec.count += 1;
  return { ok: true };
}

// ── Validate ──────────────────────────────────────────────────────────────────
const URL_PATTERN = /(https?:\/\/|www\.|\b[a-z0-9-]+\.(com|net|org|vn|info|xyz|top|ru|cn)\b)/i;
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

function cleanText(value, max) {
  if (typeof value !== "string") return "";
  return value.replace(CONTROL_CHARS, "").replace(/\s+/g, " ").trim().slice(0, max);
}

function validateReviewInput(body) {
  if (!body || typeof body !== "object") return { error: "Dữ liệu không hợp lệ" };
  const name = cleanText(body.name, 100);
  const comment = cleanText(body.comment ?? "", 1000);
  const rating = Number(body.rating);

  if (name.length < 2) return { error: "Vui lòng nhập tên của bạn (tối thiểu 2 ký tự)" };
  if (URL_PATTERN.test(name)) return { error: "Tên không được chứa đường dẫn" };
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return { error: "Đánh giá phải từ 1 đến 5 sao" };
  if (URL_PATTERN.test(comment)) return { error: "Nội dung đánh giá không được chứa đường dẫn" };

  // Chỉ nhận đúng các trường này — bỏ qua approved / ratingValue / reviewCount... do client gửi.
  return { value: { name, rating, comment } };
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const isApproved = (r) => r && r.approved === true;

function publicReview(r) {
  return {
    name: r.name,
    rating: r.rating,
    comment: r.comment || "",
    createdAt: r.createdAt,
  };
}

function approvedStats(reviews) {
  const approved = (reviews || []).filter(isApproved);
  const count = approved.length;
  const avg = count > 0
    ? Math.round((approved.reduce((s, r) => s + (Number(r.rating) || 0), 0) / count) * 10) / 10
    : 0;
  return { approved, count, avg };
}

function isValidSlug(slug) {
  return typeof slug === "string" && /^[a-z0-9-]{1,200}$/i.test(slug);
}

export default async function handler(req, res) {
  const { slug } = req.query;
  if (!isValidSlug(slug)) return res.status(400).json({ error: "Sản phẩm không hợp lệ" });

  // ── GET: công khai, chỉ review đã duyệt ──
  if (req.method === "GET") {
    try {
      await db.connectDb();
      const product = await Product.findOne({ slug }).select("reviews name").lean();
      if (!product) return res.status(404).json({ error: "Không tìm thấy sản phẩm" });

      const { approved, count, avg } = approvedStats(product.reviews);
      return res.status(200).json({
        reviews: approved.map(publicReview),
        rating: avg,
        reviewCount: count,
      });
    } catch (err) {
      console.error("GET reviews error:", err);
      return res.status(500).json({ error: "Không thể tải đánh giá" });
    }
  }

  // ── POST: Turnstile + rate limit, luôn chờ duyệt ──
  if (req.method === "POST") {
    const parsed = validateReviewInput(req.body);
    if (parsed.error) return res.status(400).json({ error: parsed.error });

    const ip = getClientIp(req);
    const tooMany = (r) => {
      res.setHeader("Retry-After", r.retryAfter || 60);
      return res.status(429).json({ error: "Bạn đã gửi đánh giá quá nhiều lần. Vui lòng thử lại sau." });
    };

    // 1) Giới hạn số lần thử (kể cả token sai) để chặn flood gọi Turnstile.
    const attempts = consume(`a:${ip}`, ATTEMPT_LIMIT, ATTEMPT_WINDOW_MS);
    if (!attempts.ok) return tooMany(attempts);

    // 2) Turnstile bắt buộc, xác minh ở server.
    const token = req.body?.turnstileToken || req.body?.["cf-turnstile-response"] || "";
    const turnstile = await verifyTurnstileToken(String(token), ip !== "unknown" ? ip : undefined);
    if (!turnstile.success) {
      return res.status(403).json({ error: turnstile.error || "Xác minh bảo mật không hợp lệ" });
    }

    // 3) Giới hạn số review đã xác minh theo IP + sản phẩm và theo IP toàn site.
    const perProduct = consume(`p:${ip}:${slug}`, PER_PRODUCT_LIMIT, PER_PRODUCT_WINDOW_MS);
    if (!perProduct.ok) return tooMany(perProduct);
    const global = consume(`g:${ip}`, GLOBAL_LIMIT, GLOBAL_WINDOW_MS);
    if (!global.ok) return tooMany(global);

    try {
      await db.connectDb();
      const product = await Product.findOne({ slug });
      if (!product) return res.status(404).json({ error: "Không tìm thấy sản phẩm" });

      product.reviews.push({ ...parsed.value, approved: false });

      // Điểm/số lượng lưu trên sản phẩm chỉ tính review đã duyệt.
      const { count, avg } = approvedStats(product.reviews);
      product.rating = avg;
      product.reviewCount = count;
      product.baseRating = null;
      product.baseReviewCount = 0;

      await product.save();

      return res.status(202).json({
        pending: true,
        message: "Cảm ơn bạn! Đánh giá đã được gửi và sẽ hiển thị sau khi được duyệt.",
      });
    } catch (err) {
      console.error("POST review error:", err);
      return res.status(500).json({ error: "Không thể gửi đánh giá. Vui lòng thử lại sau." });
    }
  }

  // ── DELETE: chỉ admin ──
  if (req.method === "DELETE") {
    const session = await requireAdmin(req, res); // tự trả 403 nếu không phải admin
    if (!session) return;

    const { reviewId } = req.query;
    if (!reviewId || !mongoose.Types.ObjectId.isValid(String(reviewId))) {
      return res.status(400).json({ error: "reviewId không hợp lệ" });
    }

    try {
      await db.connectDb();
      const product = await Product.findOne({ slug });
      if (!product) return res.status(404).json({ error: "Không tìm thấy sản phẩm" });

      const before = product.reviews.length;
      product.reviews = product.reviews.filter((r) => String(r._id) !== String(reviewId));
      if (product.reviews.length === before) {
        return res.status(404).json({ error: "Không tìm thấy đánh giá" });
      }

      const { count, avg } = approvedStats(product.reviews);
      product.rating = avg;
      product.reviewCount = count;
      product.baseRating = null;
      product.baseReviewCount = 0;

      await product.save();
      return res.status(200).json({ message: "Đã xóa đánh giá", rating: avg, reviewCount: count });
    } catch (err) {
      console.error("DELETE review error:", err);
      return res.status(500).json({ error: "Không thể xóa đánh giá" });
    }
  }

  res.setHeader("Allow", "GET, POST, DELETE");
  return res.status(405).json({ error: "Method not allowed" });
}
