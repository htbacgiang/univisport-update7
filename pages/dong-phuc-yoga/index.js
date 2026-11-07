import CategoryPageTemplate from '../../components/univisport/CategoryPageTemplate';
import YogaUniviPage, { yogaFaqs } from '../../components/univisport/bai-viet/YogaUniviPage';
import { getProductsByCategory, getSidebarNavCounts } from '../../lib/getProductsByCategory';
import { getCategoryArticleSetting } from '../../lib/categoryArticleSettings';
import { toYogaDisplayProduct } from '../../lib/yogaProductDisplay';

// URL công khai của trang
const SLUG = 'dong-phuc-yoga';
// Khóa dữ liệu trong DB đã được đồng bộ chuẩn sang 'dong-phuc-yoga'
const DATA_CATEGORY = 'dong-phuc-yoga';

const META_TITLE = 'Đồng Phục Yoga, Áo Tập Yoga Nữ Đẹp';
const META_DESCRIPTION =
  'May đồng phục Yoga, áo tập Yoga và đồ tập Yoga nữ theo yêu cầu. Đa dạng mẫu áo bra, croptop, quần legging, chất liệu co giãn và thiết kế riêng cho Yoga Studio.';
const META_KEYWORDS =
  'đồng phục Yoga, áo tập Yoga, đồ tập Yoga, quần áo tập Yoga, áo tập Yoga nữ, áo bra Yoga, áo croptop Yoga, quần tập Yoga, quần legging Yoga, bộ đồ tập Yoga nữ, đồng phục HLV Yoga, đồng phục Yoga Studio, may đồng phục Yoga theo yêu cầu';
// banner-yoga.jpg có chữ "YOGA & PILATES" in trong ảnh → dùng ảnh lớp Yoga không chữ.
const OG_IMAGE = 'https://dongphucunivi.com/images/yoga-1.jpg';
const OG_IMAGE_ALT = 'Lớp Yoga mặc đồng phục Yoga Univi: áo bra, áo peplum và legging cạp cao';

// Dự phòng khi không lấy được sản phẩm từ DB: 14 mẫu Yoga đang hiển thị (07/11/2026).
const FALLBACK_PRODUCTS = [
  { slug: 'dong-phuc-yoga-a001', name: 'Đồng Phục Yoga A001' },
  { slug: 'dong-phuc-yoga-a004', name: 'Đồng Phục Yoga A004' },
  { slug: 'dong-phuc-yoga-a005', name: 'Đồng Phục Yoga A005' },
  { slug: 'dong-phuc-yoga-a006', name: 'Đồng Phục Yoga A006' },
  { slug: 'dong-phuc-yoga-a007', name: 'Đồng Phục Yoga A007' },
  { slug: 'dong-phuc-yoga-a008', name: 'Đồng Phục Yoga A008' },
  { slug: 'dong-phuc-yoga-a3007', name: 'Đồng phục Yoga A3007' },
  { slug: 'dong-phuc-yoga-4013', name: 'Đồng phục Yoga 4013' },
  { slug: 'dong-phuc-yoga-4014', name: 'Đồng Phục Yoga A4014' },
  { slug: 'dong-phuc-yoga-a11', name: 'Đồng phục Yoga A11' },
  { slug: 'dong-phuc-yoga-a12', name: 'Đồng phục Yoga A12' },
  { slug: 'dong-phuc-yoga-a15', name: 'Đồng phục Yoga A15' },
  { slug: 'jumpsuit-yoga-jump13', name: 'Jumpsuit Yoga Jump13' },
  { slug: 'dong-phuc-yoga-act3', name: 'Đồng Phục Yoga ACT3' },
];

function buildFaqSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `https://dongphucunivi.com/${SLUG}#faq`,
    'mainEntity': yogaFaqs.map(([question, answer]) => ({
      '@type': 'Question',
      'name': question,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': answer,
      },
    })),
  };
}

function buildMeta(products = []) {
  const canonical = `https://dongphucunivi.com/${SLUG}`;
  const listProducts = products.length > 0 ? products : FALLBACK_PRODUCTS;
  return {
    title: META_TITLE,
    description: META_DESCRIPTION,
    keywords: META_KEYWORDS,
    author: 'Đồng Phục Univi',
    robots: 'index, follow',
    canonical,
    og: {
      title: META_TITLE,
      description: META_DESCRIPTION,
      type: 'website',
      image: OG_IMAGE,
      imageWidth: '2048',
      imageHeight: '1365',
      imageAlt: OG_IMAGE_ALT,
      url: canonical,
      site_name: 'Đồng Phục Univi',
      locale: 'vi_VN',
    },
    twitter: {
      card: 'summary_large_image',
      title: META_TITLE,
      description: META_DESCRIPTION,
      image: OG_IMAGE,
    },
    schema: [
      {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        '@id': `${canonical}#webpage`,
        'url': canonical,
        'name': META_TITLE,
        'description': META_DESCRIPTION,
        'isPartOf': { '@id': 'https://dongphucunivi.com/#website' },
        'about': { '@id': 'https://dongphucunivi.com/#organization' },
        'breadcrumb': { '@id': `${canonical}#breadcrumb` },
        'inLanguage': 'vi-VN',
      },
      {
        '@context': 'https://schema.org',
        '@type': 'Service',
        '@id': `${canonical}#service`,
        'name': 'May đồng phục Yoga, áo tập Yoga và đồ tập Yoga nữ theo yêu cầu',
        'description': META_DESCRIPTION,
        'provider': { '@id': 'https://dongphucunivi.com/#organization' },
        'serviceType': 'May đồng phục thể thao theo yêu cầu',
        'category': 'Đồng phục Yoga',
        'areaServed': { '@type': 'Country', 'name': 'Việt Nam' },
        'url': canonical,
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        '@id': `${canonical}#breadcrumb`,
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Trang chủ', 'item': 'https://dongphucunivi.com/' },
          { '@type': 'ListItem', 'position': 2, 'name': 'Đồng Phục Thể Thao', 'item': 'https://dongphucunivi.com/dong-phuc-the-thao' },
          { '@type': 'ListItem', 'position': 3, 'name': 'Đồng Phục Yoga', 'item': canonical },
        ],
      },
      {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        '@id': `${canonical}#itemlist`,
        'name': 'Mẫu đồng phục Yoga, áo tập Yoga và bộ đồ tập Yoga nữ của Univi',
        'url': canonical,
        'numberOfItems': Math.min(listProducts.length, 20),
        'itemListElement': listProducts.slice(0, 20).map((p, i) => ({
          '@type': 'ListItem',
          'position': i + 1,
          'url': `https://dongphucunivi.com/san-pham/${p.slug}`,
          'name': p.name,
        })),
      },
      buildFaqSchema(),
    ],
  };
}

export default function DongPhucYoga({ initialProducts, categoryCounts, gymCounts, enterpriseCounts, categoryArticle }) {
  return (
    <CategoryPageTemplate
      categorySlug={SLUG}
      initialProducts={initialProducts}
      categoryCounts={categoryCounts}
      gymCounts={gymCounts}
      enterpriseCounts={enterpriseCounts}
      ArticleComponent={YogaUniviPage}
      categoryArticle={categoryArticle}
    />
  );
}

export async function getServerSideProps() {
  try {
    const [dbProducts, sidebarCounts, categoryArticle] = await Promise.all([
      getProductsByCategory(DATA_CATEGORY),
      getSidebarNavCounts(),
      getCategoryArticleSetting(DATA_CATEGORY),
    ]);
    // Ghi đè mô tả + categoryNameVN chỉ cho trang Yoga (không sửa dữ liệu gốc trong DB).
    const initialProducts = dbProducts.map(toYogaDisplayProduct);
    return {
      props: {
        initialProducts,
        categoryCounts: sidebarCounts.categoryCounts,
        gymCounts: sidebarCounts.gymCounts,
        enterpriseCounts: sidebarCounts.enterpriseCounts,
        categoryArticle,
        meta: buildMeta(initialProducts),
      },
    };
  } catch (error) {
    console.error('Error fetching products for dong-phuc-yoga:', error.message);
    return {
      props: {
        initialProducts: [],
        categoryCounts: {},
        gymCounts: { total: 0, lines: [] },
        enterpriseCounts: { total: 0, lines: [] },
        categoryArticle: null,
        meta: buildMeta(),
      },
    };
  }
}
