export type StepIconType = "chat" | "design" | "factory" | "delivery" | "check";

export interface OrderProcessStep {
  id: string;
  stepNumber: string; // "01", "02", "03", "04"
  title: string;
  description: string;
  iconName: StepIconType;
  isVisible?: boolean;
}

export interface OrderProcessData {
  badge?: string;
  title?: string;
  steps: OrderProcessStep[];
  footerTitle?: string;
  footerText?: string;
  ctaText?: string;
  ctaSubtext?: string;
}

export const DEFAULT_ORDER_PROCESS_STEPS: OrderProcessStep[] = [
  {
    id: "step-1",
    stepNumber: "01",
    title: "TRAO ĐỔI NHU CẦU & TƯ VẤN MẪU MÃ",
    description:
      "Khách hàng cung cấp số lượng dự kiến, mục đích sử dụng, màu sắc thương hiệu, logo, yêu cầu in/thêu và thời gian cần nhận hàng. Univi tư vấn kiểu dáng, chất liệu và phương án triển khai phù hợp.",
    iconName: "chat",
    isVisible: true,
  },
  {
    id: "step-2",
    stepNumber: "02",
    title: "XÁC NHẬN THIẾT KẾ & ĐẶT CỌC",
    description:
      "Khách hàng kiểm tra bản thiết kế mô phỏng, bao gồm màu sắc, logo, vị trí in/thêu và các chi tiết đã thống nhất. Sau khi xác nhận thiết kế, khách hàng đặt cọc 50% giá trị đơn hàng để triển khai sản xuất.",
    iconName: "design",
    isVisible: true,
  },
  {
    id: "step-3",
    stepNumber: "03",
    title: "SẢN XUẤT & THEO DÕI TIẾN ĐỘ",
    description:
      "Đơn hàng được triển khai theo các thông tin đã xác nhận. Khách hàng có thể liên hệ chuyên viên phụ trách để kiểm tra và cập nhật tiến độ khi cần.",
    iconName: "factory",
    isVisible: true,
  },
  {
    id: "step-4",
    stepNumber: "04",
    title: "NHẬN HÀNG & HOÀN TẤT THANH TOÁN",
    description:
      "Khách hàng kiểm tra số lượng, mẫu mã, kích cỡ, logo và các chi tiết hoàn thiện. Nếu có sai lệch so với yêu cầu đã thống nhất, khách hàng liên hệ ngay với chuyên viên phụ trách. Sau khi nhận hàng, khách hàng thanh toán phần giá trị còn lại theo phương thức đã thỏa thuận.",
    iconName: "delivery",
    isVisible: true,
  },
];

export const DEFAULT_ORDER_PROCESS_DATA: OrderProcessData = {
  badge: "QUY TRÌNH ĐẶT HÀNG TẠI UNIVI",
  title: "Quy trình đặt may đồng phục chuẩn hóa tại Univi",
  steps: DEFAULT_ORDER_PROCESS_STEPS,
  ctaText: "Bắt đầu quy trình đặt may ngay",
  ctaSubtext: "Tư vấn mẫu mã, chọn chất liệu & thiết kế demo 100% miễn phí",
};

export const normalizeOrderProcessData = (raw: any): OrderProcessData => {
  if (!raw || typeof raw !== "object") {
    return { ...DEFAULT_ORDER_PROCESS_DATA };
  }

  const badge =
    typeof raw.badge === "string" && raw.badge.trim()
      ? raw.badge.trim()
      : DEFAULT_ORDER_PROCESS_DATA.badge;

  const title =
    typeof raw.title === "string" && raw.title.trim()
      ? raw.title.trim()
      : DEFAULT_ORDER_PROCESS_DATA.title;

  const ctaText =
    typeof raw.ctaText === "string" && raw.ctaText.trim()
      ? raw.ctaText.trim()
      : DEFAULT_ORDER_PROCESS_DATA.ctaText;

  const ctaSubtext =
    typeof raw.ctaSubtext === "string"
      ? raw.ctaSubtext.trim()
      : DEFAULT_ORDER_PROCESS_DATA.ctaSubtext;

  const footerTitle =
    typeof raw.footerTitle === "string" && raw.footerTitle.trim()
      ? raw.footerTitle.trim()
      : undefined;

  const footerText =
    typeof raw.footerText === "string" && raw.footerText.trim()
      ? raw.footerText.trim()
      : undefined;

  let steps: OrderProcessStep[] = [];
  if (Array.isArray(raw.steps) && raw.steps.length > 0) {
    steps = raw.steps.map((s: any, idx: number) => {
      const stepIdx = idx + 1;
      const defaultStep = DEFAULT_ORDER_PROCESS_STEPS[idx] || DEFAULT_ORDER_PROCESS_STEPS[0];
      return {
        id: s?.id || `step-${stepIdx}`,
        stepNumber: s?.stepNumber || (stepIdx < 10 ? `0${stepIdx}` : `${stepIdx}`),
        title: typeof s?.title === "string" ? s.title : defaultStep.title,
        description: typeof s?.description === "string" ? s.description : defaultStep.description,
        iconName: (["chat", "design", "factory", "delivery", "check"].includes(s?.iconName)
          ? s.iconName
          : defaultStep.iconName) as StepIconType,
        isVisible: s?.isVisible !== false,
      };
    });
  } else {
    steps = [...DEFAULT_ORDER_PROCESS_STEPS];
  }

  return {
    badge,
    title,
    steps,
    footerTitle,
    footerText,
    ctaText,
    ctaSubtext,
  };
};

