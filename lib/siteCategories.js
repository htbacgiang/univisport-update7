// Danh sách danh mục hiển thị trong sidebar "Danh mục" — dùng chung cho mọi trang danh mục
// (tách khỏi CategoryPageTemplate.jsx để tránh import vòng với CategoryNavSidebar).
export const SIDEBAR_CATEGORIES = [
  ['dong-phuc-gym', 'Đồng phục Gym'],
  ['dong-phuc-yoga', 'Đồng phục Yoga'],
  ['dong-phuc-pilates', 'Đồng phục Pilates'],
  ['dong-phuc-pickleball', 'Đồng phục Pickleball'],
  ['dong-phuc-chay-bo', 'Đồng phục Chạy bộ'],
  ['dong-phuc-mma', 'Đồng phục MMA'],
  ['dong-phuc-golf-tennis', 'Đồng phục Golf - Tennis'],
  ['dong-phuc-ao-gio', 'Đồng phục Áo gió'],
];

// Một số danh mục có URL công khai khác khóa dữ liệu trong DB.
export const CATEGORY_PATH_OVERRIDES = {
  'dong-phuc-yoga': 'dong-phuc-yoga',
};

// Nhãn hiển thị của danh mục
export const CATEGORY_LABEL_OVERRIDES = {
  'dong-phuc-yoga': 'Đồng phục Yoga',
};

export const getCategoryDisplayName = (categorySlug, categoryNameVN) =>
  CATEGORY_LABEL_OVERRIDES[categorySlug] || categoryNameVN;

// Khóa danh mục trong DB → đường dẫn công khai (không có dấu / ở đầu).
export const getCategoryPath = (categorySlug) =>
  CATEGORY_PATH_OVERRIDES[categorySlug] || categorySlug;

// Chuẩn hóa link nội bộ lưu trong DB (vd. viewAllLink của section trang chủ) về URL mới,
// tránh đi qua redirect 301.
export const normalizeCategoryHref = (href) => {
  if (typeof href !== 'string' || !href.startsWith('/')) return href;
  const [path, rest = ''] = href.split(/(?=[?#])/);
  const key = path.replace(/^\/+|\/+$/g, '');
  return CATEGORY_PATH_OVERRIDES[key] ? `/${CATEGORY_PATH_OVERRIDES[key]}${rest}` : href;
};
