export interface HolidayPopupConfig {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  startDate: string; // ISO String (e.g. 2026-10-19T00:00:00+07:00)
  endDate: string;   // ISO String (e.g. 2026-10-21T23:59:59+07:00)
  autoCloseSeconds: number;
  delaySeconds: number;
  componentKey: string; // "october20", "tet_holiday", etc.
  activeDays?: number;
  priority?: number;

  // Tùy biến hình ảnh và nội dung popup từ Dashboard
  bannerImage?: string;       // URL ảnh banner popup
  bannerAlt?: string;         // Alt text ảnh
  bannerPosition?: string;    // Vị trí hiển thị ảnh
  scriptTagline?: string;     // Dòng chữ viết tay phụ đề
  mainTitle?: string;         // Tiêu đề lớn in hoa
  dateSubtitle?: string;      // Dòng phụ ngày tháng
  recipientGreeting?: string; // Lời tri ân / chào gửi
  wishes?: string[];          // Các đoạn văn bản chúc mừng
  signature?: string;         // Chữ ký thương hiệu
  actionText?: string;        // Chữ trên nút hành động chính
}

export interface DefaultPopupConfig {
  type: string; // "contact_form"
  title: string;
  subtitle: string;
  autoCloseSeconds: number;
  delaySeconds: number;
  pauseOnInteraction: boolean;
  displayFrequency: "always" | "once_per_session";
}

export interface PopupTestModeConfig {
  /** Bật chế độ thử nghiệm / mở tùy ý toàn website */
  enabled: boolean;
  /** Loại popup muốn ép hiển thị: "auto" (theo lịch tự động) | "contact_form" (ép ContactForm) | "holiday" (ép ngày lễ cụ thể) */
  overrideType: "auto" | "contact_form" | "holiday";
  /** ID ngày lễ muốn ép hiển thị (ví dụ "ngay_20_10", "tet_nguyen_dan"...) */
  forcedHolidayId?: string;
  /** Bỏ qua kiểm tra lịch ngày bắt đầu - kết thúc */
  ignoreSchedule?: boolean;
  /** Hiển thị ngay lập tức không cần đợi độ trễ delay */
  forceShowImmediately?: boolean;
}

export interface PopupSettingsConfig {
  enabled: boolean;
  defaultPopup: DefaultPopupConfig;
  holidays: HolidayPopupConfig[];
  testMode?: PopupTestModeConfig;
}

export interface ActivePopupResolved {
  hasPopup: boolean;
  popupType: "holiday" | "contact_form" | "none";
  activeHoliday?: HolidayPopupConfig | null;
  defaultPopup: DefaultPopupConfig;
  autoCloseSeconds: number;
  delaySeconds: number;
  pauseOnInteraction: boolean;
  isTestMode?: boolean;
  forceShow?: boolean;
}
