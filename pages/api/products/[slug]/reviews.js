import db from "../../../../utils/db";
import Product from "../../../../models/Product";

export default async function handler(req, res) {
  await db.connectDb();
  const { slug } = req.query;

  if (req.method === "GET") {
    try {
      const product = await Product.findOne({ slug }).select("reviews rating reviewCount name");
      if (!product) return res.status(404).json({ error: "Không tìm thấy sản phẩm" });

      const realReviews = product.reviews || [];
      const realCount = realReviews.length;
      const realAvg = realCount > 0
        ? Math.round((realReviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / realCount) * 10) / 10
        : 0;

      return res.status(200).json({
        reviews: realReviews,
        rating: realAvg,
        reviewCount: realCount,
        productName: product.name,
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === "POST") {
    try {
      const { name, rating, comment } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({ error: "Vui lòng nhập tên của bạn" });
      }
      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ error: "Đánh giá phải từ 1 đến 5 sao" });
      }

      const product = await Product.findOne({ slug });
      if (!product) return res.status(404).json({ error: "Không tìm thấy sản phẩm" });

      product.reviews.push({
        name: name.trim().slice(0, 100),
        rating: Number(rating),
        comment: (comment || "").trim().slice(0, 1000),
      });

      // Tính rating thực tế chỉ dựa trên đánh giá thật của khách hàng
      const totalCount = product.reviews.length;
      const userRatingsSum = product.reviews.reduce((a, r) => a + (Number(r.rating) || 0), 0);

      product.rating = totalCount > 0
        ? Math.round((userRatingsSum / totalCount) * 10) / 10
        : 0;
      product.reviewCount = totalCount;
      product.baseRating = null;
      product.baseReviewCount = 0;

      await product.save();

      const newReview = product.reviews[product.reviews.length - 1];
      return res.status(201).json({
        review: newReview,
        rating: product.rating,
        reviewCount: product.reviewCount,
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // DELETE /api/products/[slug]/reviews?reviewId=<_id>
  if (req.method === "DELETE") {
    try {
      const { reviewId } = req.query;
      if (!reviewId) return res.status(400).json({ error: "Thiếu reviewId" });

      const product = await Product.findOne({ slug });
      if (!product) return res.status(404).json({ error: "Không tìm thấy sản phẩm" });

      const before = product.reviews.length;
      product.reviews = product.reviews.filter((r) => String(r._id) !== String(reviewId));

      if (product.reviews.length === before) {
        return res.status(404).json({ error: "Không tìm thấy đánh giá" });
      }

      // Tính lại rating thực tế sau khi xóa
      const totalCount = product.reviews.length;
      const userRatingsSum = product.reviews.reduce((a, r) => a + (Number(r.rating) || 0), 0);

      product.rating = totalCount > 0
        ? Math.round((userRatingsSum / totalCount) * 10) / 10
        : 0;
      product.reviewCount = totalCount;
      product.baseRating = null;
      product.baseReviewCount = 0;

      await product.save();

      return res.status(200).json({
        message: "Đã xóa đánh giá",
        rating: product.rating,
        reviewCount: product.reviewCount,
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
