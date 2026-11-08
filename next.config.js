/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Ẩn header X-Powered-By: Next.js
  poweredByHeader: false,

  async redirects() {
    return [
      {
        source: "/bo-su-tam",
        destination: "/bo-suu-tap",
        permanent: true,
      },
      // SEO migration 07/11/2026: pillar Yoga chuyển sang URL mới (301, không chain).
      {
        source: "/dong-phuc-yoga-pilates",
        destination: "/dong-phuc-yoga",
        statusCode: 301,
      },
      {
        source: "/dong-phuc-yoga-pilates/:path*",
        destination: "/dong-phuc-yoga/:path*",
        statusCode: 301,
      },
      // Sprint 0.4.3 (08/11/2026): 301 cho URL cũ đã 404 (audit R1–R6), 1 hop, không về trang chủ.
      // R1–R5: slug blog bị đổi ngày 06/11 không kèm redirect.
      {
        source: "/bai-viet/welly-fitness-chon-univi-dong-phuc-5-sao",
        destination: "/bai-viet/welly-fitness-chon-univi-dong-phuc-5-sao-chuan-cong-nghe",
        statusCode: 301,
      },
      {
        source: "/bai-viet/dong-phuc-hlv-goldmark-fitness",
        destination: "/bai-viet/dong-phuc-hlv-goldmark-fitness-chuan-form-and-chuyen-nghiep-trong-van-hanh",
        statusCode: 301,
      },
      // R3, R4: slug tạo từ tiêu đề của bài đích TRÙNG với source. Nếu bài đích bị lưu lại
      // khi lỗi SeoForm (tự đổi slug) chưa được vá, slug sẽ thành source và redirect này chặn bài.
      {
        source: "/bai-viet/feedback-dong-phuc-one-coach-fitness-bac-ninh",
        destination: "/bai-viet/feedback-dong-phuc-one-coach-fitness-bac-ninh-or-univi",
        statusCode: 301,
      },
      {
        source: "/bai-viet/ao-gym-dai-tay-8-mau-and-cach-chon-cho-phong-tap",
        destination: "/bai-viet/ao-gym-dai-tay-8-mau-and-cach-chon-cho-phong-tap-or-univi",
        statusCode: 301,
      },
      {
        source: "/bai-viet/20-mau-ao-gym-dep-cho-phong-tap-2026",
        destination: "/bai-viet/20-mau-ao-gym-dep-cho-phong-tap-and-pt-studio-2026",
        statusCode: 301,
      },
      // R6: URL cũ từng nằm trong sitemap đến 07/11.
      {
        source: "/polo-doanh-nghiep",
        destination: "/dong-phuc-polo",
        statusCode: 301,
      },
      // Sprint 0.4.4 (08/11/2026): 5 bài bị lỗi SeoForm tự đổi slug khi lưu; giữ slug mới (= slug tạo từ tiêu đề).
      {
        source: "/bai-viet/vai-pique-the-thao-univi",
        destination: "/bai-viet/vai-pique-the-thao-uni-cool-pique-mem-mat-co-gian",
        statusCode: 301,
      },
      {
        source: "/bai-viet/ao-polo-the-thao-cho-hlv-phong-tap",
        destination: "/bai-viet/ao-polo-the-thao-cho-hlv-phong-tap-vi-sao-khac-polo-truyen-thong",
        statusCode: 301,
      },
      {
        source: "/bai-viet/bao-gia-dong-phuc-the-thao-thang-102026-or-univi",
        destination: "/bai-viet/bao-gia-dong-phuc-the-thao-thang-102026",
        statusCode: 301,
      },
      {
        source: "/bai-viet/bao-gia-ao-pickleball-theo-so-luong-102026-or-univi",
        destination: "/bai-viet/bao-gia-ao-pickleball-theo-so-luong-102026",
        statusCode: 301,
      },
      {
        source: "/bai-viet/ao-choi-the-thao-khac-ao-bong-da-nhu-the-nao-or-univi",
        destination: "/bai-viet/ao-choi-the-thao-khac-ao-bong-da-nhu-the-nao",
        statusCode: 301,
      },
    ];
  },

  async headers() {
    return [
      // ======================================================
      // 1. Security Headers áp dụng cho toàn bộ website
      // ======================================================
      {
        source: "/(.*)",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
          },
          {
            key: "X-XSS-Protection",
            value: "0",
          },
        ],
      },

      // ======================================================
      // 2. CORS cho API (giữ nguyên cấu hình của bạn)
      // ======================================================
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          {
            key: "Access-Control-Allow-Origin",
            value: "https://dongphucunivi.com",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,DELETE,PATCH,POST,PUT",
          },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
          },
        ],
      },
    ];
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "live.staticflickr.com",
      },
      {
        protocol: "https",
        hostname: "dongphucunivi.com",
      },
      {
        protocol: "https",
        hostname: "img.dongphucunivi.com",
      },
      {
        protocol: "https",
        hostname: "**.dongphucunivi.com",
      },
      {
        protocol: "https",
        hostname: "example.com",
      },
      {
        protocol: "https",
        hostname: "scontent.fhan18-1.fna.fbcdn.net",
      },
      {
        protocol: "https",
        hostname: "**.r2.dev",
      },
      {
        protocol: "https",
        hostname: "**.r2.cloudflarestorage.com",
      },
    ],
  },
};

module.exports = nextConfig;