import CategoryPageTemplate from '../../components/univisport/CategoryPageTemplate';
import GymUniviPage, { gymFaqs, GymHero } from '../../components/univisport/bai-viet/GymUniviPage';
import { getProductsByCategory, getSidebarNavCounts } from '../../lib/getProductsByCategory';
import { getCategoryArticleSetting } from '../../lib/categoryArticleSettings';

const SLUG = 'dong-phuc-gym';
const SITE = 'https://dongphucunivi.com';
const META_TITLE = 'Đồng Phục Gym & Áo Tập Gym Cho Phòng Tập | Univi';
const META_DESCRIPTION =
  'Đồng phục Gym, áo tập Gym cho phòng tập, HLV và PT. Khám phá 24 mẫu áo Univi, 5 dòng vải thể thao và giải pháp thiết kế theo nhận diện thương hiệu.';
const PAGE_NAME = 'Đồng phục Gym – Áo tập Gym cho phòng tập và đội ngũ Fitness';
const AUTHOR_URL = `${SITE}/dong-sang-lap-univi-sport-tran-hien`;
const AUTHOR_ID = `${AUTHOR_URL}#person`;

const META_KEYWORDS =
  'đồng phục Gym, áo tập Gym, đồng phục phòng Gym, đồng phục cho phòng tập, đồng phục Fitness, đồng phục HLV Gym, đồng phục nhân viên phòng Gym, áo tập Gym cho nam, áo tập Gym cho nữ, áo Polo thể thao, UNI DRY, UNI SUPERCOOL, UNI QUICKDRY, 2S Uniform';
const OG_IMAGE = `${SITE}/images/banner-ao-gym.jpg`;
const OG_IMAGE_ALT = 'Đồng phục Gym và áo tập Gym Univi cho phòng tập, HLV và PT';

function buildFaqSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${SITE}/${SLUG}#faq`,
    'mainEntity': gymFaqs.map(([question, answer]) => ({
      '@type': 'Question',
      'name': question,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': answer,
      },
    })),
  };
}

// FAQ schema chỉ phát ra khi trang đang hiển thị bài mặc định (GymUniviPage), tránh lệch với nội dung
// hiển thị nếu Dashboard chuyển sang bài "custom" hoặc ẩn bài.
function shouldEmitDefaultFaq(categoryArticle) {
  if (!categoryArticle) return true;
  if (categoryArticle.isVisible === false) return false;
  return !(categoryArticle.articleType === 'custom' && categoryArticle.article);
}

function buildMeta(products = [], categoryArticle = null) {
  const canonical = `${SITE}/${SLUG}`;
  return {
    title: META_TITLE,
    description: META_DESCRIPTION,
    keywords: META_KEYWORDS,
    author: 'Trần Hiền',
    robots: 'index, follow',
    canonical,
    og: {
      title: META_TITLE,
      description: META_DESCRIPTION,
      type: 'website',
      image: OG_IMAGE,
      imageWidth: '1200',
      imageHeight: '630',
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
        'name': PAGE_NAME,
        'description': META_DESCRIPTION,
        'isPartOf': { '@id': `${SITE}/#website` },
        'about': { '@id': `${SITE}/#organization` },
        'author': { '@id': AUTHOR_ID },
        'breadcrumb': { '@id': `${canonical}#breadcrumb` },
        'inLanguage': 'vi-VN',
        ...(products.length > 0 ? { 'mainEntity': { '@id': `${canonical}#itemlist` } } : {}),
      },
      {
        '@context': 'https://schema.org',
        '@type': 'Service',
        '@id': `${canonical}#service`,
        'name': 'Thiết kế và may đồng phục Gym theo yêu cầu',
        'description': META_DESCRIPTION,
        'provider': { '@id': `${SITE}/#organization` },
        'serviceType': 'May đồng phục thể thao theo yêu cầu',
        'category': 'Đồng phục Gym',
        'areaServed': { '@type': 'Country', 'name': 'Việt Nam' },
        'url': canonical,
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        '@id': `${canonical}#breadcrumb`,
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Trang chủ', 'item': `${SITE}/` },
          { '@type': 'ListItem', 'position': 2, 'name': 'Đồng Phục Thể Thao', 'item': `${SITE}/dong-phuc-the-thao` },
          { '@type': 'ListItem', 'position': 3, 'name': 'Đồng Phục Gym', 'item': canonical },
        ],
      },
      ...(products.length > 0 ? [{
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        '@id': `${canonical}#itemlist`,
        'name': 'Bộ sưu tập đồng phục Gym Univi',
        'url': canonical,
        'numberOfItems': products.length,
        'itemListElement': products.map((p, i) => ({
          '@type': 'ListItem',
          'position': i + 1,
          'url': `${SITE}/san-pham/${p.slug}`,
          'name': p.name,
        })),
      }] : []),
      ...(shouldEmitDefaultFaq(categoryArticle) ? [buildFaqSchema()] : []),
    ],
  };
}

export default function DongPhucGym({
  initialProducts,
  categoryCounts,
  enterpriseCounts,
  categoryArticle,
}) {
  return (
    <CategoryPageTemplate
      categorySlug={SLUG}
      initialProducts={initialProducts}
      categoryCounts={categoryCounts}
      enterpriseCounts={enterpriseCounts}
      ArticleComponent={GymUniviPage}
      HeroComponent={GymHero}
      productsAnchorId="bo-suu-tap-gym"
      categoryArticle={categoryArticle}
    />
  );
}

export async function getServerSideProps() {
  try {
    const [allProducts, sidebarCounts, categoryArticle] = await Promise.all([
      getProductsByCategory(SLUG),
      getSidebarNavCounts(),
      getCategoryArticleSetting(SLUG),
    ]);

    // Trang này không hiển thị `description` (mô tả ngắn được sinh từ dữ liệu có cấu trúc),
    // nên không gửi xuống client: giảm payload __NEXT_DATA__ và tránh đưa claim chưa xác minh vào HTML.
    // Không thay đổi dữ liệu sản phẩm trong DB.
    const initialProducts = allProducts.map(({ description, ...rest }) => rest);

    return {
      props: {
        initialProducts,
        categoryCounts: sidebarCounts.categoryCounts,
        enterpriseCounts: sidebarCounts.enterpriseCounts,
        categoryArticle,
        meta: buildMeta(initialProducts, categoryArticle),
      },
    };
  } catch (error) {
    console.error(`Error fetching products for ${SLUG}:`, error.message);

    return {
      props: {
        initialProducts: [],
        categoryCounts: {},
        enterpriseCounts: { total: 0, lines: [] },
        categoryArticle: null,
        meta: buildMeta(),
      },
    };
  }
}
