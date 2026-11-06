import React, { FC, useState, useEffect } from "react";
import {
  X,
  RotateCcw,
  Check,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  MessageSquareText,
  Palette,
  Factory,
  PackageCheck,
  CheckCircle2,
  ListChecks,
} from "lucide-react";
import {
  OrderProcessData,
  OrderProcessStep,
  StepIconType,
  DEFAULT_ORDER_PROCESS_DATA,
  normalizeOrderProcessData,
} from "../univisport/order-process/orderProcessData";

interface Props {
  visible: boolean;
  initialData: OrderProcessData;
  onClose: () => void;
  onSave: (data: OrderProcessData) => void;
}

const ICON_OPTIONS: { value: StepIconType; label: string; icon: React.ReactNode }[] = [
  { value: "chat", label: "Tư vấn / Trao đổi", icon: <MessageSquareText className="w-4 h-4" /> },
  { value: "design", label: "Thiết kế / Đặt cọc", icon: <Palette className="w-4 h-4" /> },
  { value: "factory", label: "Sản xuất / Tiến độ", icon: <Factory className="w-4 h-4" /> },
  { value: "delivery", label: "Giao nhận / Thanh toán", icon: <PackageCheck className="w-4 h-4" /> },
  { value: "check", label: "Hoàn tất / Xác nhận", icon: <CheckCircle2 className="w-4 h-4" /> },
];

export const UniviOrderProcessModal: FC<Props> = ({
  visible,
  initialData,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<OrderProcessData>(() =>
    normalizeOrderProcessData(initialData)
  );

  useEffect(() => {
    if (visible) {
      setFormData(normalizeOrderProcessData(initialData));
    }
  }, [visible, initialData]);

  if (!visible) return null;

  const handleFieldChange = (field: keyof OrderProcessData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleStepChange = (
    index: number,
    field: keyof OrderProcessStep,
    value: any
  ) => {
    setFormData((prev) => {
      const updatedSteps = [...prev.steps];
      updatedSteps[index] = { ...updatedSteps[index], [field]: value };
      return { ...prev, steps: updatedSteps };
    });
  };

  const handleMoveStep = (index: number, direction: "up" | "down") => {
    setFormData((prev) => {
      const updatedSteps = [...prev.steps];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= updatedSteps.length) return prev;

      const temp = updatedSteps[index];
      updatedSteps[index] = updatedSteps[targetIndex];
      updatedSteps[targetIndex] = temp;

      // Cập nhật lại số thứ tự tự động
      const renumbered = updatedSteps.map((s, idx) => ({
        ...s,
        stepNumber: idx + 1 < 10 ? `0${idx + 1}` : `${idx + 1}`,
      }));

      return { ...prev, steps: renumbered };
    });
  };

  const handleToggleVisibility = (index: number) => {
    setFormData((prev) => {
      const updatedSteps = [...prev.steps];
      const current = updatedSteps[index].isVisible !== false;
      updatedSteps[index] = { ...updatedSteps[index], isVisible: !current };
      return { ...prev, steps: updatedSteps };
    });
  };

  const handleResetDefault = () => {
    if (
      window.confirm(
        "Bạn có chắc chắn muốn khôi phục toàn bộ nội dung quy trình đặt hàng về mặc định không?"
      )
    ) {
      setFormData(normalizeOrderProcessData(DEFAULT_ORDER_PROCESS_DATA));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#105d97] text-white flex items-center justify-center shadow-xs">
              <ListChecks className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">
                Chỉnh sửa Quy trình đặt hàng Univi
              </h3>
              <p className="text-xs text-gray-500">
                Tùy biến tiêu đề, nội dung 4 bước, thứ tự và thông điệp thương hiệu
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Modal (Form) */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Nhóm Thông tin chung */}
          <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 space-y-3">
            <div className="text-xs font-bold text-[#105d97] uppercase tracking-wider">
              Thông tin chung
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Nhãn phía trên (Badge):
                </label>
                <input
                  type="text"
                  value={formData.badge || ""}
                  onChange={(e) => handleFieldChange("badge", e.target.value)}
                  placeholder="QUY TRÌNH ĐẶT HÀNG TẠI UNIVI"
                  className="w-full text-sm px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#105d97]/20 focus:border-[#105d97] outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Tiêu đề chính:
                </label>
                <input
                  type="text"
                  value={formData.title || ""}
                  onChange={(e) => handleFieldChange("title", e.target.value)}
                  placeholder="Tiêu đề quy trình..."
                  className="w-full text-sm px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#105d97]/20 focus:border-[#105d97] outline-none"
                />
              </div>
            </div>
          </div>

          {/* Danh sách các bước */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#105d97] uppercase tracking-wider">
                Các bước thực hiện ({formData.steps.length} bước)
              </span>
              <span className="text-xs text-gray-500">
                Dùng nút mũi tên để thay đổi thứ tự các bước
              </span>
            </div>

            <div className="space-y-3">
              {formData.steps.map((step, index) => {
                const isVisible = step.isVisible !== false;

                return (
                  <div
                    key={step.id || `step-${index}`}
                    className={`p-4 rounded-xl border transition-all ${
                      isVisible
                        ? "bg-white border-slate-200 shadow-xs"
                        : "bg-gray-50 border-gray-200 opacity-60"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-[#105d97] text-white flex items-center justify-center font-mono font-bold text-xs">
                          {step.stepNumber}
                        </span>
                        <span className="text-xs font-bold text-gray-800">
                          Bước {index + 1}
                        </span>
                        {!isVisible && (
                          <span className="text-[10px] font-semibold bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                            Đang ẩn
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        {/* Ẩn / hiện */}
                        <button
                          type="button"
                          onClick={() => handleToggleVisibility(index)}
                          className={`p-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                            isVisible
                              ? "text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                              : "text-gray-500 bg-gray-200 hover:bg-gray-300"
                          }`}
                          title={isVisible ? "Ẩn bước này ngoài website" : "Hiện lại bước này"}
                        >
                          {isVisible ? (
                            <>
                              <Eye className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline text-[11px]">Hiện</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline text-[11px]">Ẩn</span>
                            </>
                          )}
                        </button>

                        {/* Di chuyển lên */}
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => handleMoveStep(index, "up")}
                          className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-md disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                          title="Di chuyển lên trên"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>

                        {/* Di chuyển xuống */}
                        <button
                          type="button"
                          disabled={index === formData.steps.length - 1}
                          onClick={() => handleMoveStep(index, "down")}
                          className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-md disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                          title="Di chuyển xuống dưới"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div className="sm:col-span-3">
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Tên bước:
                        </label>
                        <input
                          type="text"
                          value={step.title}
                          onChange={(e) => handleStepChange(index, "title", e.target.value)}
                          className="w-full text-sm font-semibold px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#105d97]/20 focus:border-[#105d97] outline-none"
                        />
                      </div>

                      <div className="sm:col-span-1">
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Icon minh họa:
                        </label>
                        <select
                          value={step.iconName}
                          onChange={(e) =>
                            handleStepChange(index, "iconName", e.target.value as StepIconType)
                          }
                          className="w-full text-xs px-2.5 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#105d97]/20 focus:border-[#105d97] outline-none bg-white cursor-pointer"
                        >
                          {ICON_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="sm:col-span-4">
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Nội dung mô tả chi tiết:
                        </label>
                        <textarea
                          rows={2}
                          value={step.description}
                          onChange={(e) =>
                            handleStepChange(index, "description", e.target.value)
                          }
                          className="w-full text-xs sm:text-sm px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#105d97]/20 focus:border-[#105d97] outline-none leading-relaxed"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cấu hình Nút CTA mở Popup ContactForm */}
          <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 space-y-3">
            <div className="text-xs font-bold text-[#105d97] uppercase tracking-wider">
              Nút kêu gọi hành động (Mở Popup ContactForm)
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Chữ hiển thị trên nút CTA:
              </label>
              <input
                type="text"
                value={formData.ctaText || ""}
                onChange={(e) => handleFieldChange("ctaText", e.target.value)}
                placeholder="Bắt đầu quy trình đặt may ngay"
                className="w-full text-sm px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#105d97]/20 focus:border-[#105d97] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Dòng ghi chú phụ bên dưới nút (tùy chọn):
              </label>
              <input
                type="text"
                value={formData.ctaSubtext || ""}
                onChange={(e) => handleFieldChange("ctaSubtext", e.target.value)}
                placeholder="Tư vấn mẫu mã, chọn chất liệu & thiết kế demo 100% miễn phí"
                className="w-full text-sm px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#105d97]/20 focus:border-[#105d97] outline-none"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleResetDefault}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors border border-amber-200 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Khôi phục mặc định</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#105d97] hover:bg-[#0d4c7a] rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Lưu thay đổi</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UniviOrderProcessModal;

