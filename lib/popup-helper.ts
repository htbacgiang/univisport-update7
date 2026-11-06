import {
  PopupSettingsConfig,
  ActivePopupResolved,
  HolidayPopupConfig,
  DefaultPopupConfig,
} from "../types/popup";
import { DEFAULT_POPUP_SETTINGS } from "../data/defaultPopupSettings";
import { getHolidayDefaultTemplate } from "../data/holidayTemplates";

/**
 * Chuẩn hóa cấu hình Popup từ DB hoặc fallback
 */
export function normalizePopupConfig(raw: any): PopupSettingsConfig {
  if (!raw) return DEFAULT_POPUP_SETTINGS as unknown as PopupSettingsConfig;

  const defaultPopup: DefaultPopupConfig = {
    type: "contact_form",
    title: raw.defaultPopup?.title || DEFAULT_POPUP_SETTINGS.defaultPopup.title,
    subtitle: raw.defaultPopup?.subtitle || DEFAULT_POPUP_SETTINGS.defaultPopup.subtitle,
    autoCloseSeconds: Number(raw.defaultPopup?.autoCloseSeconds) > 0 ? Number(raw.defaultPopup.autoCloseSeconds) : 20,
    delaySeconds: Number(raw.defaultPopup?.delaySeconds) >= 0 ? Number(raw.defaultPopup.delaySeconds) : 2,
    pauseOnInteraction: raw.defaultPopup?.pauseOnInteraction !== false,
    displayFrequency: raw.defaultPopup?.displayFrequency === "once_per_session" ? "once_per_session" : "always",
  };

  const holidays: HolidayPopupConfig[] = Array.isArray(raw.holidays)
    ? raw.holidays.map((h: any, idx: number) => {
        const compKey = String(h.componentKey || "october20");
        const defaultTpl = getHolidayDefaultTemplate(compKey, h.name);

        return {
          id: String(h.id || `holiday_${idx}`),
          name: String(h.name || "Ngày lễ"),
          description: String(h.description || ""),
          enabled: Boolean(h.enabled),
          startDate: String(h.startDate || new Date().toISOString()),
          endDate: String(h.endDate || new Date().toISOString()),
          autoCloseSeconds: Number(h.autoCloseSeconds) > 0 ? Number(h.autoCloseSeconds) : 30,
          delaySeconds: Number(h.delaySeconds) >= 0 ? Number(h.delaySeconds) : 3,
          componentKey: compKey,
          activeDays: Number(h.activeDays) > 0 ? Number(h.activeDays) : 3,
          priority: Number(h.priority) || 1,

          // Mặc định luôn tự động lấy nội dung mẫu chuẩn nếu chưa được tùy chỉnh hoặc để trống
          bannerImage: typeof h.bannerImage === "string" && h.bannerImage.trim() ? h.bannerImage.trim() : defaultTpl.bannerImage,
          bannerAlt: typeof h.bannerAlt === "string" && h.bannerAlt.trim() ? h.bannerAlt.trim() : defaultTpl.bannerAlt,
          bannerPosition: typeof h.bannerPosition === "string" && h.bannerPosition.trim() ? h.bannerPosition.trim() : defaultTpl.bannerPosition,
          scriptTagline: typeof h.scriptTagline === "string" && h.scriptTagline.trim() ? h.scriptTagline.trim() : defaultTpl.scriptTagline,
          mainTitle: typeof h.mainTitle === "string" && h.mainTitle.trim() ? h.mainTitle.trim() : defaultTpl.mainTitle,
          dateSubtitle: typeof h.dateSubtitle === "string" && h.dateSubtitle.trim() ? h.dateSubtitle.trim() : defaultTpl.dateSubtitle,
          wishes:
            Array.isArray(h.wishes) && h.wishes.length > 0
              ? h.wishes.map(String).map((s: string) => s.trim()).filter(Boolean)
              : typeof h.wishes === "string" && h.wishes.trim()
              ? h.wishes.split(/\n+/).map((s: string) => s.trim()).filter(Boolean)
              : defaultTpl.wishes,
          signature: typeof h.signature === "string" && h.signature.trim() ? h.signature.trim() : defaultTpl.signature,
          actionText: typeof h.actionText === "string" && h.actionText.trim() ? h.actionText.trim() : defaultTpl.actionText,
        };
      })
    : (DEFAULT_POPUP_SETTINGS.holidays as HolidayPopupConfig[]);

  const testMode = {
    enabled: Boolean(raw.testMode?.enabled),
    overrideType: raw.testMode?.overrideType || "auto",
    forcedHolidayId: String(raw.testMode?.forcedHolidayId || "ngay_20_10"),
    ignoreSchedule: raw.testMode?.ignoreSchedule !== false,
    forceShowImmediately: Boolean(raw.testMode?.forceShowImmediately),
  };

  return {
    enabled: raw.enabled !== false,
    defaultPopup,
    holidays,
    testMode,
  };
}

/**
 * Kiểm tra xem một ngày lễ có đang trong thời gian hiệu lực không
 */
export function isHolidayActive(holiday: HolidayPopupConfig, checkDate: Date = new Date()): boolean {
  if (!holiday.enabled) return false;
  try {
    const nowTime = checkDate.getTime();
    const startTime = new Date(holiday.startDate).getTime();
    const endTime = new Date(holiday.endDate).getTime();

    if (isNaN(startTime) || isNaN(endTime)) return false;
    return nowTime >= startTime && nowTime <= endTime;
  } catch {
    return false;
  }
}

/**
 * Xác định popup nào sẽ được hiển thị ngay thời điểm hiện tại:
 * 1. Nếu bật chế độ test tùy ý (testMode) -> Ép hiển thị popup được chọn ngay lập tức để test giao diện & nội dung!
 * 2. Nếu tắt toàn bộ popup -> "none"
 * 3. Nếu có ngày lễ Việt Nam đang active -> "holiday" (ưu tiên holiday có priority cao nhất)
 * 4. Hết ngày hiển thị ngày lễ (hoặc không có ngày lễ nào active) -> Tự động quay lại popup mặc định là "contact_form"!
 */
export function resolveActivePopup(
  config: PopupSettingsConfig,
  currentDate: Date = new Date()
): ActivePopupResolved {
  // 1. Chế độ Mở Tùy Ý / Thử Nghiệm (Test Mode Override)
  if (config.testMode?.enabled && config.testMode.overrideType !== "auto") {
    if (config.testMode.overrideType === "contact_form") {
      return {
        hasPopup: true,
        popupType: "contact_form",
        activeHoliday: null,
        defaultPopup: config.defaultPopup,
        autoCloseSeconds: config.defaultPopup.autoCloseSeconds || 20,
        delaySeconds: config.testMode.forceShowImmediately ? 0 : config.defaultPopup.delaySeconds || 2,
        pauseOnInteraction: config.defaultPopup.pauseOnInteraction !== false,
        isTestMode: true,
        forceShow: true,
      };
    }

    if (config.testMode.overrideType === "holiday") {
      const forcedId = config.testMode.forcedHolidayId;
      const holiday =
        (config.holidays || []).find((h) => h.id === forcedId) ||
        (config.holidays || []).find((h) => h.componentKey === "october20") ||
        config.holidays?.[0];

      if (holiday) {
        return {
          hasPopup: true,
          popupType: "holiday",
          activeHoliday: holiday,
          defaultPopup: config.defaultPopup,
          autoCloseSeconds: holiday.autoCloseSeconds || 30,
          delaySeconds: config.testMode.forceShowImmediately ? 0 : holiday.delaySeconds || 3,
          pauseOnInteraction: true,
          isTestMode: true,
          forceShow: true,
        };
      }
    }
  }

  // 2. Nếu toàn bộ popup bị tắt
  if (!config.enabled) {
    return {
      hasPopup: false,
      popupType: "none",
      defaultPopup: config.defaultPopup,
      autoCloseSeconds: config.defaultPopup.autoCloseSeconds,
      delaySeconds: config.defaultPopup.delaySeconds,
      pauseOnInteraction: config.defaultPopup.pauseOnInteraction,
    };
  }

  // 3. Lọc các ngày lễ đang active tại thời điểm này
  const activeHolidays = (config.holidays || [])
    .filter((h) => isHolidayActive(h, currentDate))
    .sort((a, b) => (b.priority || 0) - (a.priority || 0));

  if (activeHolidays.length > 0) {
    const activeHoliday = activeHolidays[0];
    return {
      hasPopup: true,
      popupType: "holiday",
      activeHoliday,
      defaultPopup: config.defaultPopup,
      autoCloseSeconds: activeHoliday.autoCloseSeconds || 30,
      delaySeconds: activeHoliday.delaySeconds || 3,
      pauseOnInteraction: true,
    };
  }

  // Khi hết ngày hiển thị hoặc không có ngày lễ nào -> Quay lại popup mặc định là ContactForm!
  return {
    hasPopup: true,
    popupType: "contact_form",
    activeHoliday: null,
    defaultPopup: config.defaultPopup,
    autoCloseSeconds: config.defaultPopup.autoCloseSeconds || 20,
    delaySeconds: config.defaultPopup.delaySeconds || 2,
    pauseOnInteraction: config.defaultPopup.pauseOnInteraction !== false,
  };
}
