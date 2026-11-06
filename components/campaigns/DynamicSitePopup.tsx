import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import { normalizePopupConfig, resolveActivePopup } from "../../lib/popup-helper";
import { DEFAULT_POPUP_SETTINGS } from "../../data/defaultPopupSettings";
import type { PopupSettingsConfig, ActivePopupResolved, HolidayPopupConfig } from "../../types/popup";

// Dynamic import các popup để tối ưu hiệu năng và code-splitting
const October20Popup = dynamic(() => import("./October20Popup"), { ssr: false });
const ContactFormPopup = dynamic(() => import("./ContactFormPopup"), { ssr: false });
const HolidayFestivePopup = dynamic(() => import("./HolidayFestivePopup"), { ssr: false });
const TetHolidayPopup = dynamic(() => import("./TetHolidayPopup"), { ssr: false });
const WomenDay83Popup = dynamic(() => import("./WomenDay83Popup"), { ssr: false });
const VictoryDay304Popup = dynamic(() => import("./VictoryDay304Popup"), { ssr: false });
const NationalDay29Popup = dynamic(() => import("./NationalDay29Popup"), { ssr: false });
const TeachersDay2011Popup = dynamic(() => import("./TeachersDay2011Popup"), { ssr: false });
const XmasNewYearPopup = dynamic(() => import("./XmasNewYearPopup"), { ssr: false });

/**
 * Registry component ngày lễ Việt Nam:
 * Tự động kích hoạt đúng component tương ứng với từng ngày lễ
 */
export const HOLIDAY_COMPONENT_REGISTRY: Record<
  string,
  React.ComponentType<any>
> = {
  october20: October20Popup,
  tet_holiday: TetHolidayPopup,
  women_day_83: WomenDay83Popup,
  holiday_304: VictoryDay304Popup,
  national_day_29: NationalDay29Popup,
  teachers_day_2011: TeachersDay2011Popup,
  xmas_newyear: XmasNewYearPopup,
  festive_default: HolidayFestivePopup,
};

export interface DynamicSitePopupProps {
  /** Ép hiển thị component cụ thể để test (optional) */
  forceType?: "contact_form" | "holiday";
  forceHolidayKey?: string;
  forceHoliday?: HolidayPopupConfig | null;
}

export const DynamicSitePopup: React.FC<DynamicSitePopupProps> = ({
  forceType,
  forceHolidayKey,
  forceHoliday,
}) => {
  const router = useRouter();
  const [config, setConfig] = useState<PopupSettingsConfig>(() =>
    normalizePopupConfig(DEFAULT_POPUP_SETTINGS)
  );
  const [resolved, setResolved] = useState<ActivePopupResolved>(() =>
    resolveActivePopup(normalizePopupConfig(DEFAULT_POPUP_SETTINGS))
  );
  const [hasLoadedConfig, setHasLoadedConfig] = useState(false);

  // Popup chỉ hiển thị duy nhất ở trang chủ (/)
  const currentPath = router?.asPath || router?.pathname || "";
  const cleanPath = currentPath.split("?")[0].split("#")[0];
  const isHomePage = router?.pathname === "/" || cleanPath === "" || cleanPath === "/";

  // Đọc query param ?popup_test=... từ URL để test nhanh ngoài trang chủ (nếu cần)
  const queryPopupTest = typeof router?.query?.popup_test === "string" ? router.query.popup_test : null;

  // Loại trừ: Chỉ hiển thị duy nhất tại trang chủ (/), trừ khi ép test bằng forceType (preview trong dashboard) hoặc param ?popup_test
  const isExcludedRoute =
    !forceType &&
    !queryPopupTest &&
    (!isHomePage ||
      currentPath.startsWith("/dashboard") ||
      currentPath.startsWith("/admin") ||
      currentPath.startsWith("/auth"));

  // Tải cấu hình popup từ API
  useEffect(() => {
    if (isExcludedRoute || typeof window === "undefined") return;

    let isMounted = true;
    async function fetchPopupSettings() {
      try {
        const res = await fetch("/api/popup-settings");
        if (!res.ok) throw new Error("Fetch popup failed");
        const data = await res.json();
        if (data && data.config && isMounted) {
          const normalized = normalizePopupConfig(data.config);
          setConfig(normalized);
          setResolved(data.resolved || resolveActivePopup(normalized));
          setHasLoadedConfig(true);
        }
      } catch {
        if (isMounted) setHasLoadedConfig(true);
      }
    }

    fetchPopupSettings();
    return () => {
      isMounted = false;
    };
  }, [isExcludedRoute]);

  if (isExcludedRoute) return null;

  // ========================================================
  // CHẾ ĐỘ 1: ÉP HIỂN THỊ QUA PROPS (Modal Preview trong Dashboard)
  // ========================================================
  if (forceType === "holiday") {
    const Component =
      (forceHolidayKey && HOLIDAY_COMPONENT_REGISTRY[forceHolidayKey]) ||
      HolidayFestivePopup;
    return <Component holiday={forceHoliday} forceShow={true} />;
  }

  if (forceType === "contact_form") {
    return (
      <ContactFormPopup
        forceShow={true}
        autoCloseSeconds={config.defaultPopup.autoCloseSeconds || 20}
        pauseOnInteraction={config.defaultPopup.pauseOnInteraction}
        title={config.defaultPopup.title}
        subtitle={config.defaultPopup.subtitle}
      />
    );
  }

  // ========================================================
  // CHẾ ĐỘ 2: ÉP HIỂN THỊ QUA URL PARAM (?popup_test=...)
  // ========================================================
  if (queryPopupTest) {
    if (queryPopupTest === "contact_form" || queryPopupTest === "contact") {
      return (
        <ContactFormPopup
          forceShow={true}
          autoCloseSeconds={config.defaultPopup.autoCloseSeconds || 20}
          pauseOnInteraction={config.defaultPopup.pauseOnInteraction}
          title={config.defaultPopup.title}
          subtitle={config.defaultPopup.subtitle}
        />
      );
    }

    // Tìm ngày lễ trong danh sách tương ứng với ID hoặc componentKey
    const matchedHoliday =
      config.holidays.find((h) => h.id === queryPopupTest || h.componentKey === queryPopupTest) ||
      config.holidays[0];

    const Component =
      HOLIDAY_COMPONENT_REGISTRY[matchedHoliday?.componentKey || queryPopupTest] ||
      HolidayFestivePopup;

    return <Component holiday={matchedHoliday} forceShow={true} />;
  }

  // ========================================================
  // CHẾ ĐỘ 3: ÉP HIỂN THỊ TOÀN SITE TỪ DATABASE TEST MODE
  // ========================================================
  if (resolved.isTestMode && resolved.forceShow) {
    if (resolved.popupType === "contact_form") {
      return (
        <ContactFormPopup
          forceShow={true}
          autoCloseSeconds={resolved.autoCloseSeconds || 20}
          delayMs={(resolved.delaySeconds || 0) * 1000}
          pauseOnInteraction={resolved.pauseOnInteraction}
          title={resolved.defaultPopup?.title}
          subtitle={resolved.defaultPopup?.subtitle}
        />
      );
    }

    if (resolved.popupType === "holiday" && resolved.activeHoliday) {
      const holiday = resolved.activeHoliday;
      const Component =
        HOLIDAY_COMPONENT_REGISTRY[holiday.componentKey] || HolidayFestivePopup;
      return <Component holiday={holiday} forceShow={true} />;
    }
  }

  // ========================================================
  // CHẾ ĐỘ 4: CHẠY BÌNH THƯỜNG THEO THỜI GIAN THỰC
  // ========================================================
  if (!resolved.hasPopup || resolved.popupType === "none") {
    return null;
  }

  // Nếu có ngày lễ Việt Nam đang trong lịch hiển thị
  if (resolved.popupType === "holiday" && resolved.activeHoliday) {
    const holiday = resolved.activeHoliday;
    const Component = HOLIDAY_COMPONENT_REGISTRY[holiday.componentKey] || HolidayFestivePopup;

    return (
      <Component
        holiday={holiday}
        campaignConfig={{
          enabled: holiday.enabled,
          startDate: holiday.startDate,
          endDate: holiday.endDate,
          autoCloseMs: (holiday.autoCloseSeconds || 90) * 1000,
          delayMs: (holiday.delaySeconds || 3) * 1000,
        }}
      />
    );
  }

  // Hết ngày hiển thị ngày lễ (hoặc không có ngày lễ nào active)
  // Tự động quay lại Popup mặc định là ContactForm!
  return (
    <ContactFormPopup
      autoCloseSeconds={resolved.autoCloseSeconds || 20}
      delayMs={(resolved.delaySeconds || 2) * 1000}
      pauseOnInteraction={resolved.pauseOnInteraction}
      title={resolved.defaultPopup?.title}
      subtitle={resolved.defaultPopup?.subtitle}
      displayFrequency={resolved.defaultPopup?.displayFrequency || "always"}
    />
  );
};

export default DynamicSitePopup;

