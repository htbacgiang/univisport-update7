import mongoose from "mongoose";

const holidaySchema = new mongoose.Schema(
  {
    id: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    enabled: { type: Boolean, default: false },
    startDate: { type: String, required: true, trim: true }, // ISO string: YYYY-MM-DDTHH:mm:ss
    endDate: { type: String, required: true, trim: true },   // ISO string: YYYY-MM-DDTHH:mm:ss
    autoCloseSeconds: { type: Number, default: 90 },
    delaySeconds: { type: Number, default: 3 },
    componentKey: { type: String, default: "october20", trim: true }, // e.g. "october20", "tet", "women_day", etc.
    activeDays: { type: Number, default: 3 }, // Số ngày hiển thị (tiện ích tính nhanh)
    priority: { type: Number, default: 1 },

    // Tùy biến hình ảnh và nội dung popup
    bannerImage: { type: String, default: "" },
    bannerAlt: { type: String, default: "" },
    bannerPosition: { type: String, default: "object-[center_30%]" },
    scriptTagline: { type: String, default: "" },
    mainTitle: { type: String, default: "" },
    dateSubtitle: { type: String, default: "" },
    recipientGreeting: { type: String, default: "" },
    wishes: { type: [String], default: [] },
    signature: { type: String, default: "Trân trọng, UniVi Sport" },
    actionText: { type: String, default: "" },
  },
  { _id: false, strict: false }
);

const popupSettingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: "global",
      unique: true,
      immutable: true,
    },
    // Bật/tắt toàn bộ popup trên trang web
    enabled: {
      type: Boolean,
      default: true,
    },
    // Cấu hình popup mặc định (ContactForm) khi không có ngày lễ nào active
    defaultPopup: {
      type: {
        type: String,
        default: "contact_form",
      },
      title: {
        type: String,
        default: "Đăng ký tư vấn & Báo giá đồng phục UniVi",
        trim: true,
      },
      subtitle: {
        type: String,
        default: "Nhận báo giá chi tiết, xem mẫu vải tận nơi & thiết kế 3D miễn phí trong 15 phút",
        trim: true,
      },
      // Thời gian tự động đóng (giây) - mặc định 20 giây theo yêu cầu
      autoCloseSeconds: {
        type: Number,
        default: 20,
      },
      // Độ trễ trước khi popup xuất hiện (giây)
      delaySeconds: {
        type: Number,
        default: 2,
      },
      // Dừng đếm ngược khi người dùng điền hoặc tương tác vào form
      pauseOnInteraction: {
        type: Boolean,
        default: true,
      },
      // Tần suất hiển thị: "always" (mỗi lần vào web/F5) hoặc "once_per_session" (1 lần/phiên)
      displayFrequency: {
        type: String,
        enum: ["always", "once_per_session"],
        default: "always",
      },
    },
    // Danh sách các popup ngày lễ đặc biệt của Việt Nam
    holidays: {
      type: [holidaySchema],
      default: [],
    },
    // Chế độ mở tùy ý / thử nghiệm giao diện & nội dung
    testMode: {
      enabled: { type: Boolean, default: false },
      overrideType: {
        type: String,
        enum: ["auto", "contact_form", "holiday"],
        default: "auto",
      },
      forcedHolidayId: { type: String, default: "ngay_20_10", trim: true },
      ignoreSchedule: { type: Boolean, default: true },
      forceShowImmediately: { type: Boolean, default: false },
    },
  },
  { timestamps: true, strict: false }
);

if (mongoose.models && mongoose.models.PopupSetting) {
  delete mongoose.models.PopupSetting;
}

const PopupSetting =
  mongoose.models.PopupSetting ||
  mongoose.model("PopupSetting", popupSettingSchema);

export default PopupSetting;
