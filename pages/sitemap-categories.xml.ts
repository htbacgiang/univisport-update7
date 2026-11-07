
import { GetServerSideProps } from "next";

const baseUrl = "https://dongphucunivi.com";

// Danh sách URL danh mục đã đối chiếu với SEO Audit 07/11/2026
const categories = [
  // Đồng phục thể thao
  "dong-phuc-the-thao",
  "dong-phuc-gym",
  "dong-phuc-yoga",
  "dong-phuc-pilates",
  "dong-phuc-pickleball",
  "dong-phuc-ao-gio",
  "dong-phuc-chay-bo",
  "dong-phuc-golf-tennis",
  "dong-phuc-mma",

  // Đồng phục doanh nghiệp
  "dong-phuc-doanh-nghiep",
  "polo-doanh-nghiep",
  "dong-phuc-so-mi",
  "dong-phuc-vest-cong-so",
  "dong-phuc-teambuilding",
  "bao-ho-lao-dong",
  "phu-kien-qua-tang-doanh-nghiep",
] as const;

function generate() {
  const urls = categories
    .map(
      (slug) => `
  <url>
    <loc>${baseUrl}/${slug}</loc>
  </url>`
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  res.setHeader("Content-Type", "application/xml; charset=utf-8");

  res.setHeader(
    "Cache-Control",
    "public, s-maxage=86400, stale-while-revalidate=3600"
  );

  res.statusCode = 200;
  res.end(generate());

  return {
    props: {},
  };
};

export default function SitemapCategories() {
  return null;
}
