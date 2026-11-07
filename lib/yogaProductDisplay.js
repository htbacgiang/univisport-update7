// Nội dung hiển thị riêng cho trang /dong-phuc-yoga.
//
// Sản phẩm Yoga đã được đồng bộ category 'dong-phuc-yoga' và categoryNameVN 'Đồng phục Yoga'.
// Trang Yoga ghi đè các trường hiển thị mô tả ngắn tối ưu tại đây.

export const YOGA_CATEGORY_NAME_VN = 'Đồng phục Yoga';

// Viết lại từ mô tả DB + docs/knowledge/12-dong-phuc-yoga.md, chỉ giữ thông tin Yoga.
export const YOGA_PRODUCT_COPY = {
  A001: 'Set đồng phục Yoga A001 Univi: áo bra 2 dây và legging cạp cao, vải Super Cool mát mịn, công nghệ UNI DRY thoát ẩm, nhiều màu.',
  A004: 'Set đồng phục Yoga A004 Univi: áo peplum bèo eo lưng đan chéo và legging cạp cao, vải Super Cool mát mịn, công nghệ UNI DRY thoát ẩm, 8 màu.',
  A005: 'Set đồng phục Yoga A005 Univi: áo bra lưng đan dây nghệ thuật và legging cạp cao, vải Super Cool mát mịn, công nghệ UNI DRY thoát ẩm, 7 màu.',
  A006: 'Set đồng phục Yoga A006 Univi: áo croptop quai bản to ôm dáng và legging cạp cao, vải Super Cool, công nghệ UNI DRY thoát ẩm.',
  A007: 'Set đồng phục Yoga A007 Univi: áo bra quai bèo cánh tiên, lưng đan dây buộc nữ tính và legging cạp cao, vải Super Cool, công nghệ UNI DRY.',
  A008: 'Set đồng phục Yoga A008 Univi: áo bra racerback lưng chữ T nâng đỡ và legging cạp cao, co giãn 4 chiều, công nghệ UNI DRY thoát ẩm.',
  A3007: 'Set đồng phục Yoga A3007 Univi: áo bra và legging cạp cao.',
  A4013: 'Set đồng phục Yoga A4013 Univi: áo bra lệch vai vải gân và legging cạp cao, co giãn 4 chiều, công nghệ UNI DRY thoát ẩm.',
  A4014: 'Đồng phục Yoga A4014: set Yoga nữ phong cách tối giản, hiện đại, dễ ứng dụng cho Yoga Studio và đội ngũ giáo viên hướng dẫn.',
  A11: 'Set đồng phục Yoga A11 Univi: áo bra lưng đan dây chéo kép nâng đỡ và legging cạp cao tôn dáng, vải Super Cool mát mịn, công nghệ UNI DRY thoát ẩm.',
  A12: 'Đồng phục Yoga A12 gồm áo bra và legging cạp cao, vải mềm co giãn, phù hợp Yoga Studio và đội nhóm. Nhận may theo màu nhận diện.',
  A15: 'Đồng phục Yoga A15 thiết kế gọn dáng, vải mềm co giãn, phù hợp Yoga Studio và giáo viên hướng dẫn. Nhận may theo màu nhận diện.',
  JUMP13: 'Jumpsuit Yoga Jump13 thiết kế liền thân sát nách, quần ống loe và lưng đan dây nổi bật, phù hợp Yoga Studio và lớp Yoga nữ.',
  ACT3: 'Áo đồng phục Yoga ACT3 Univi có form ôm tự nhiên, co giãn 4 chiều, thoáng khí và dễ tùy chỉnh màu theo thương hiệu studio. Phù hợp Yoga Studio, HLV Yoga và Wellness Center.',
};

const OFF_TOPIC = /pilates|pickleball/i;

export function toYogaDisplayProduct(product) {
  if (!product) return product;
  const code = product.maSanPham || '';
  let description = YOGA_PRODUCT_COPY[code];
  if (!description) {
    // Sản phẩm Yoga mới chưa có copy riêng: chỉ dùng mô tả DB nếu không lạc chủ đề.
    description = product.description && !OFF_TOPIC.test(product.description)
      ? product.description
      : `${product.name} - mẫu đồng phục Yoga của Univi, nhận may theo màu nhận diện studio.`;
  }
  return { ...product, description, categoryNameVN: YOGA_CATEGORY_NAME_VN };
}
