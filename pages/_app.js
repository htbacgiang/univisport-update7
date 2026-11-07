import "../styles/globals.css";
import localFont from "next/font/local";
import { Provider } from "react-redux";
import store, { persistor } from "../store";
import { SessionProvider } from "next-auth/react";
import { PersistGate } from "redux-persist/integration/react";
import { Toaster } from "react-hot-toast";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useRef } from "react";
import CookieConsent from "../components/tracking/CookieConsent";
import MetaPixel from "../components/tracking/MetaPixel";
import GoogleAnalytics from "../components/common/GoogleAnalytics";
import dynamic from "next/dynamic";

const DynamicSitePopup = dynamic(
  () => import("../components/campaigns/DynamicSitePopup"),
  { ssr: false }
);

import { COMPANY_INFO } from "../lib/companyInfo";

// Global polyfill for Promise.withResolvers if not available
if (typeof Promise !== "undefined" && !Promise.withResolvers) {
  Promise.withResolvers = function () {
    let resolve, reject;
    const promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  };
}

const siteFont = localFont({
  variable: "--font-site",
  display: "block",
  src: [
    { path: "../public/fonts/SVN-Gilroy-Thin.otf", weight: "100", style: "normal" },
    { path: "../public/fonts/SVN-Gilroy-Regular.otf", weight: "400", style: "normal" },
    { path: "../public/fonts/SVN-Gilroy-Medium.otf", weight: "500", style: "normal" },
  ],
});

// Helper: tự động detect đúng MIME type từ URL ảnh
function getImageMimeType(url = "") {
  if (url.includes(".webp")) return "image/webp";
  if (url.includes(".png")) return "image/png";
  if (url.includes(".gif")) return "image/gif";
  return "image/jpeg";
}


const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://dongphucunivi.com/#organization",
  "name": "Đồng Phục Univi",
  "url": "https://dongphucunivi.com",
  "logo": {
    "@type": "ImageObject",
    "url": "https://dongphucunivi.com/images/logo-univi-2.png",
    "width": 512,
    "height": 512,
  },
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://dongphucunivi.com/#website",
  "url": "https://dongphucunivi.com/",
  "name": "Đồng Phục Univi",
  "description": "Đồng Phục Univi chuyên thiết kế và sản xuất đồng phục thể thao, đồng phục phòng tập, đồng phục huấn luyện viên chất lượng cao — xưởng sản xuất tại Hà Nội, giao hàng toàn quốc.",
  "publisher": {
    "@id": "https://dongphucunivi.com/#organization",
  },
  "inLanguage": "vi-VN",
  "copyrightYear": "2017",
  "copyrightHolder": {
    "@id": "https://dongphucunivi.com/#organization",
  },
};

function getSessionId() {
  if (typeof sessionStorage === "undefined") return "";
  let id = sessionStorage.getItem("_sid");
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem("_sid", id);
  }
  return id;
}

function genViewId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function postJson(url, data) {
  const body = JSON.stringify(data);
  if (typeof navigator !== "undefined" && navigator.sendBeacon) {
    navigator.sendBeacon(url, new Blob([body], { type: "application/json" }));
  } else {
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => { });
  }
}

const DEFAULT_ROBOTS = "index, follow";
const NOINDEX_ROUTES = new Set([
  "/dang-nhap",
  "/dang-ky",
  "/auth/signin",
]);

function getRobotsContent(pathname, robots) {
  if (pathname.startsWith("/dashboard") || NOINDEX_ROUTES.has(pathname)) {
    return "noindex, nofollow";
  }

  if (typeof robots === "string" && robots.trim()) {
    return robots.trim();
  }

  return DEFAULT_ROBOTS;
}

function MyApp({ Component, pageProps: { session, meta, ...pageProps } }) {
  const router = useRouter();
  // Lưu viewId và thời điểm bắt đầu của trang hiện tại
  const viewIdRef = useRef("");
  const pageStartRef = useRef(0);

  useEffect(() => {
    if (router.pathname.startsWith("/dashboard")) return;

    const sessionId = getSessionId();

    // Ghi nhận trang hiện tại ngay lập tức (duration = 0, sẽ update khi rời trang)
    const recordEntry = (path, title) => {
      const vid = genViewId();
      viewIdRef.current = vid;
      pageStartRef.current = Date.now();
      fetch("/api/analytics/pageview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          viewId: vid,
          path,
          title,
          duration: 0,
          referrer: document.referrer,
          sessionId,
        }),
      }).catch(() => { });
    };

    // Cập nhật duration khi rời trang, dùng sendBeacon cho trường hợp đóng tab
    const recordExit = () => {
      if (!viewIdRef.current) return;
      const duration = Math.round((Date.now() - pageStartRef.current) / 1000);
      postJson("/api/analytics/duration", { viewId: viewIdRef.current, duration });
      viewIdRef.current = "";
    };

    recordEntry(router.asPath, document.title);

    const handleRouteChangeStart = () => {
      if (typeof window !== "undefined") {
        document.documentElement.style.scrollBehavior = "auto";
      }
      recordExit();
    };

    const handleRouteChangeComplete = (url) => {
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      }
      if (url.startsWith("/dashboard")) return;
      setTimeout(() => recordEntry(url, document.title), 0);
    };

    const handleBeforeUnload = () => {
      recordExit();
    };

    router.events.on("routeChangeStart", handleRouteChangeStart);
    router.events.on("routeChangeComplete", handleRouteChangeComplete);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      router.events.off("routeChangeStart", handleRouteChangeStart);
      router.events.off("routeChangeComplete", handleRouteChangeComplete);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // FAQ thương hiệu chỉ inject đúng 1 nơi: trang chủ
  const isHomePage = router.pathname === "/";
  const isDashboardRoute = router.pathname.startsWith("/dashboard");
  const homepageFaqSchema =
    Array.isArray(pageProps.homepageFaqs) && pageProps.homepageFaqs.length > 0
      ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": pageProps.homepageFaqs.map((faq) => ({
          "@type": "Question",
          "name": faq.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.answer,
          },
        })),
      }
      : null;

  const ogImageType = getImageMimeType(meta?.og?.image);
  const safeOg = meta?.og || {};
  const safeTwitter = meta?.twitter || {};
  const robotsContent = getRobotsContent(router.pathname, meta?.robots);

  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
          key="viewport"
        />
        <meta name="robots" content={robotsContent} key="robots" />
        {meta && (
          <>
            <title>{meta.title}</title>
            <meta name="description" content={meta.description} />
            <meta name="keywords" content={meta.keywords} />
            <meta name="author" content={meta.author} />
            <link rel="canonical" href={meta.canonical} />

            {/* Geo & Language */}
            <meta name="geo.region" content="VN" />
            <meta name="geo.placename" content="Hà Nội" />
            <meta name="geo.position" content="20.9832437;105.7788691" />
            <meta name="ICBM" content="20.9832437, 105.7788691" />
            <meta name="language" content="vi-VN" />
            <meta name="revisit-after" content="7 days" />
            <meta name="theme-color" content="#105d97" />
            <meta name="msapplication-TileColor" content="#105d97" />

            {/* Open Graph */}
            <meta property="og:title" content={safeOg.title ?? meta.title} />
            <meta property="og:description" content={safeOg.description ?? meta.description} />
            <meta property="og:type" content={safeOg.type ?? "website"} />
            <meta property="og:image" content={safeOg.image ?? "https://dongphucunivi.com/images/banner-home-1.jpg"} />
            <meta property="og:image:width" content={safeOg.imageWidth ?? "1200"} />
            <meta property="og:image:height" content={safeOg.imageHeight ?? "630"} />
            <meta
              property="og:image:alt"
              content={safeOg.imageAlt ?? "Đồng Phục Univi - Đồng phục thể thao chuyên nghiệp"}
            />
            <meta property="og:image:type" content={ogImageType} />
            <meta property="og:url" content={safeOg.url ?? meta.canonical} />
            <meta property="og:site_name" content={safeOg.site_name ?? "Đồng Phục Univi"} />
            <meta property="og:locale" content="vi_VN" />

            {/* Twitter */}
            <meta name="twitter:card" content={safeTwitter.card ?? "summary_large_image"} />
            <meta name="twitter:title" content={safeTwitter.title ?? meta.title} />
            <meta name="twitter:description" content={safeTwitter.description ?? meta.description} />
            <meta name="twitter:image" content={safeTwitter.image ?? safeOg.image ?? "https://dongphucunivi.com/images/banner-home-1.jpg"} />
          </>
        )}

        {/*
          ── JSON-LD: Organization + WebSite ──────────────────────────
          Inject trên MỌI trang — KHÔNG phụ thuộc vào meta.
          Đây là nguồn canonical duy nhất cho entity thương hiệu.
          Các trang con chỉ reference qua @id, KHÔNG khai báo lại Organization.
        */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([organizationSchema, websiteSchema]).replace(/</g, "\\u003c"),
          }}
        />

        {/*
          ── JSON-LD: FAQPage thương hiệu ─────────────────────────────
          CHỈ inject ở trang chủ (pathname === "/").
          Trang bài viết [slug].tsx tự inject FAQPage riêng → không duplicate.
        */}
        {isHomePage && homepageFaqSchema && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(homepageFaqSchema).replace(/</g, "\\u003c"),
            }}
          />
        )}

        {/*
          ── JSON-LD động theo từng trang ─────────────────────────────
          Article, Product, CollectionPage, BreadcrumbList, AboutPage...
          Được generate trong getServerSideProps và truyền qua meta.schema.
        */}
        {meta?.schema && Array.isArray(meta.schema) && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(meta.schema).replace(/</g, "\\u003c") }}
          />
        )}
      </Head>
      <SessionProvider session={session} refetchOnWindowFocus={false}>
        <Provider store={store}>
          {/*
            appContent dùng chung cho cả loading và children của PersistGate.
            Khi PersistGate switch từ "chưa rehydrate" → "đã rehydrate",
            React thấy cùng cấu trúc JSX ở cả 2 nhánh → reconcile tại chỗ,
            KHÔNG unmount BannerTTG → không flash ảnh.
            Toaster nằm bên ngoài PersistGate để không bị ảnh hưởng bởi switch.
          */}
          <Toaster position="bottom-right" />
          {!isDashboardRoute && <DynamicSitePopup />}
          <PersistGate
            loading={
              <div
                className={`${siteFont.variable} ${siteFont.className}`}
                style={{ fontFamily: "var(--font-univi-site)" }}
              >
                <Component meta={meta} {...pageProps} />
                {!isDashboardRoute && (
                  <>
                    <GoogleAnalytics />
                    <MetaPixel />
                    <CookieConsent />
                  </>
                )}
              </div>
            }
            persistor={persistor}
          >
            <div
              className={`${siteFont.variable} ${siteFont.className}`}
              style={{ fontFamily: "var(--font-univi-site)" }}
            >
              <Component meta={meta} {...pageProps} />
              {!isDashboardRoute && (
                <>
                  <GoogleAnalytics />
                  <MetaPixel />
                  <CookieConsent />
                </>
              )}
            </div>
          </PersistGate>
        </Provider>
      </SessionProvider>
    </>
  );
}

export default MyApp;
