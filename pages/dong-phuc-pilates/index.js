import CategoryPageTemplate from '../../components/univisport/CategoryPageTemplate';
import PilatesUniviPage, { pilatesFaqs } from '../../components/univisport/bai-viet/PilatesUniviPage';
import { getProductsByCategory, getSidebarNavCounts } from '../../lib/getProductsByCategory';
import { getCategoryArticleSetting } from '../../lib/categoryArticleSettings';

const SLUG = 'dong-phuc-pilates';
const META_TITLE = 'Đồng Phục Pilates & Áo Tập Pilates Cho Studio | Univi';
const META_DESCRIPTION =
  'Đồng phục Pilates, áo tập Pilates cho studio và HLV: mẫu áo, chất liệu, form cho Mat và Reformer, thiết kế và sản xuất theo nhận diện thương hiệu tại Univi.';
const META_KEYWORDS =
  'đồng phục Pilates, áo tập Pilates, áo đồng phục Pilates, áo tập Pilates nữ, áo Pilates Reformer, đồng phục Pilates Studio, đồng phục HLV Pilates, đồng phục giáo viên Pilates, đồng phục Pilates Reformer, may đồng phục Pilates, vải Super Cool, công nghệ UNI DRY, giải pháp 2S Uniform';
const PAGE_HEADING = 'Đồng phục Pilates và áo tập Pilates: giải pháp cho studio và HLV';
const OG_IMAGE = 'https://dongphucunivi.com/thumbnail/dong-phuc-pilates.png';
const OG_IMAGE_ALT = 'Đồng phục Pilates và áo tập Pilates cho studio, HLV - Đồng Phục Univi';

// Dự phòng khi không lấy được sản phẩm từ DB: đúng 8 mẫu đang hiển thị trên trang.
const FALLBACK_PRODUCTS = [
  { slug: 'ao-dong-phuc-pilates-ag29', name: 'Đồng Phục Pilates AG29' },
  { slug: 'dong-phuc-pilates-plt03', name: 'Đồng phục Pilates PLT03' },
  { slug: 'dong-phuc-pilates-plt02', name: 'Đồng phục Pilates PLT02' },
  { slug: 'dong-phuc-pilates-pl15', name: 'Đồng Phục Pilates PL15' },
  { slug: 'dong-phuc-yoga-act1', name: 'Đồng phục Pilates ACT1' },
  { slug: 'dong-phuc-pilates-act7', name: 'Đồng phục Pilates ACT7' },
  { slug: 'dong-phuc-pilates-apl1', name: 'Đồng Phục Pilates APL1' },
  { slug: 'dong-phuc-yoga-bdcv', name: 'Đồng Phục Pilates BDCV' },
];

function buildFaqSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `https://dongphucunivi.com/${SLUG}#faq`,
    'mainEntity': pilatesFaqs.map(([question, answer]) => ({
      '@type': 'Question',
      'name': question,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': answer,
      },
    })),
  };
}

function buildArticleSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `https://dongphucunivi.com/${SLUG}#article`,
    'headline': PAGE_HEADING,
    'image': OG_IMAGE,
    'about': [
      { '@type': 'Thing', 'name': 'Đồng phục Pilates' },
      { '@type': 'Thing', 'name': 'Áo tập Pilates' },
    ],
    'description': META_DESCRIPTION,
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': `https://dongphucunivi.com/${SLUG}`,
    },
    'author': {
      '@type': 'Organization',
      'name': 'Đồng Phục Univi',
      'url': 'https://dongphucunivi.com',
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'Đồng Phục Univi',
      'url': 'https://dongphucunivi.com',
      'logo': {
        '@type': 'ImageObject',
        'url': 'https://dongphucunivi.com/logo-univi.webp',
      },
    },
    'inLanguage': 'vi-VN',
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
      imageWidth: '1672',
      imageHeight: '941',
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
        'inLanguage': 'vi-VN',
      },
      {
        '@context': 'https://schema.org',
        '@type': 'Service',
        '@id': `${canonical}#service`,
        'name': 'Thiết kế và may đồng phục Pilates, áo tập Pilates theo yêu cầu cho studio và HLV',
        'description': META_DESCRIPTION,
        'provider': { '@id': 'https://dongphucunivi.com/#organization' },
        'serviceType': 'May đồng phục thể thao theo yêu cầu',
        'category': 'Đồng phục Pilates',
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
          { '@type': 'ListItem', 'position': 3, 'name': 'Đồng Phục Pilates', 'item': canonical },
        ],
      },
      {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        '@id': `${canonical}#itemlist`,
        'name': 'Mẫu đồng phục Pilates và áo tập Pilates của Univi',
        'url': canonical,
        'numberOfItems': Math.min(listProducts.length, 20),
        'itemListElement': listProducts.slice(0, 20).map((p, i) => ({
          '@type': 'ListItem',
          'position': i + 1,
          'url': `https://dongphucunivi.com/san-pham/${p.slug}`,
          'name': p.name,
        })),
      },
      buildArticleSchema(),
      buildFaqSchema(),
    ],
  };
}

export default function DongPhucPilates({ initialProducts, categoryCounts, gymCounts, enterpriseCounts, categoryArticle }) {
  return (
    <CategoryPageTemplate
      categorySlug={SLUG}
      initialProducts={initialProducts}
      categoryCounts={categoryCounts}
      gymCounts={gymCounts}
      enterpriseCounts={enterpriseCounts}
      ArticleComponent={PilatesUniviPage}
      categoryArticle={categoryArticle}
    />
  );
}

export async function getServerSideProps() {
  try {
    const [initialProducts, sidebarCounts, categoryArticle] = await Promise.all([
      getProductsByCategory(SLUG),
      getSidebarNavCounts(),
      getCategoryArticleSetting(SLUG),
    ]);

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
    console.error('Error fetching products for dong-phuc-pilates:', error.message);
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
