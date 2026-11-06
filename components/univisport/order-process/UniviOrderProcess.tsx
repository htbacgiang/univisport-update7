import React, { FC, useEffect, useRef, useState, useMemo } from "react";
import {
  MessageSquareText,
  Palette,
  Factory,
  PackageCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import ContactForm from "../../header/ContactForm";
import {
  OrderProcessData,
  OrderProcessStep,
  StepIconType,
  DEFAULT_ORDER_PROCESS_DATA,
  normalizeOrderProcessData,
} from "./orderProcessData";

export interface UniviOrderProcessProps {
  badge?: string;
  title?: string;
  steps?: OrderProcessStep[];
  footerTitle?: string;
  footerText?: string;
  ctaText?: string;
  ctaSubtext?: string;
  // Cho phép nhận toàn bộ qua prop 'data' hoặc trực tiếp
  data?: OrderProcessData;
  className?: string;
  isEditorPreview?: boolean;
}

const renderStepIcon = (iconName: StepIconType, className = "w-5 h-5") => {
  switch (iconName) {
    case "chat":
      return <MessageSquareText className={className} />;
    case "design":
      return <Palette className={className} />;
    case "factory":
      return <Factory className={className} />;
    case "delivery":
      return <PackageCheck className={className} />;
    case "check":
    default:
      return <CheckCircle2 className={className} />;
  }
};

export const UniviOrderProcess: FC<UniviOrderProcessProps> = (rawProps) => {
  const mergedData = useMemo(() => {
    const source = rawProps.data || rawProps;
    return normalizeOrderProcessData(source);
  }, [rawProps]);

  const { badge, title, steps, footerTitle, footerText, ctaText, ctaSubtext } = mergedData;
  const isEditorPreview = Boolean(rawProps.isEditorPreview);
  const [contactOpen, setContactOpen] = useState(false);

  // Chỉ hiển thị các bước không bị ẩn
  const visibleSteps = useMemo(() => {
    return steps.filter((s) => s.isVisible !== false);
  }, [steps]);

  // Ref cho scroll animation bằng IntersectionObserver
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  useEffect(() => {
    if (isEditorPreview) {
      setIsInView(true);
      return;
    }

    // Kiểm tra prefers-reduced-motion
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px",
      }
    );

    const currentEl = containerRef.current;
    if (currentEl) {
      observer.observe(currentEl);
    }

    return () => {
      if (currentEl) {
        observer.unobserve(currentEl);
      }
    };
  }, [isEditorPreview]);

  return (
    <div
      ref={containerRef}
      className={`univi-order-process not-prose my-5 w-full max-w-6xl mx-auto ${rawProps.className || ""}`}
      style={{
        contentVisibility: "visible",
      }}
    >
      <div className="relative bg-white p-4 sm:p-6 md:p-8 transition-all duration-300">
        {/* Header Component */}
        <div className="text-center mb-8 sm:mb-12 relative z-10">
          {badge && (
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white text-[#105d97] text-xs sm:text-sm font-bold tracking-wider uppercase mb-3 border border-slate-200 shadow-xs">
              <span>{badge}</span>
            </div>
          )}

          <div className="w-16 h-1 bg-[#105d97] rounded-full mx-auto mt-3.5" />
        </div>

        {/* Khối 4 bước liên kết dọc */}
        <div className="relative z-10">
          {/* Đường kết nối dọc giữa các bước */}
          <div
            className="absolute left-[23px] sm:left-[27px] md:left-[35px] top-6 bottom-6 w-[2px] bg-slate-200"
            aria-hidden="true"
          >
            {/* Thanh tiến trình màu xanh Univi */}
            <div
              className={`w-full bg-[#105d97] transition-all duration-1000 ease-out ${isInView ? "h-full opacity-100" : "h-0 opacity-0"
                }`}
            />
          </div>

          <div className="space-y-4 sm:space-y-6 md:space-y-8">
            {visibleSteps.map((step, index) => {
              const delay = isEditorPreview ? 0 : index * 120;

              return (
                <div
                  key={step.id || `step-${index}`}
                  className={`group relative flex items-start gap-3 sm:gap-5 md:gap-6 transition-all duration-500 ease-out ${isInView
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4"
                    }`}
                  style={{
                    transitionDelay: `${delay}ms`,
                  }}
                >
                  {/* Cột số thứ tự & icon nền trắng */}
                  <div className="relative flex flex-col items-center flex-shrink-0 z-10">
                    <div
                      className="w-12 h-12 sm:w-14 sm:h-14 md:w-18 md:h-18 rounded-2xl flex items-center justify-center font-black transition-all duration-300 shadow-xs bg-white text-[#105d97] border-2 border-[#105d97] group-hover:shadow-md group-hover:scale-105"
                    >
                      <div className="flex flex-col items-center justify-center leading-none">
                        <span className="text-base sm:text-lg md:text-xl font-black tracking-tight font-mono text-[#105d97]">
                          {step.stepNumber}
                        </span>
                        <span className="mt-0.5 text-[#105d97] transition-transform duration-300 group-hover:scale-110">
                          {renderStepIcon(step.iconName, "w-3.5 h-3.5 sm:w-4 sm:h-4")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Thẻ nội dung bước nền trắng */}
                  <div className="flex-1 min-w-0 bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 border border-slate-200 shadow-xs transition-all duration-300 ease-out group-hover:-translate-y-1 group-hover:shadow-md group-hover:border-[#105d97]">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2 sm:mb-2.5">
                      <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#105d97] uppercase tracking-wider bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">
                        <span>Bước {step.stepNumber}</span>
                      </div>

                    </div>

                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-[#0f2c4d] tracking-tight leading-snug group-hover:text-[#105d97] transition-colors">
                      {step.title}
                    </h3>

                    <p className="mt-2 text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed font-normal">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Nút CTA mở Popup ContactForm */}
        <div className="mt-4 sm:mt-6 pt-2 sm:pt-4 text-center relative z-10">
          <button
            type="button"
            onClick={() => {
              if (isEditorPreview) {
                alert("Bản xem trước Editor: Nút này sẽ mở Popup ContactForm đăng ký tư vấn khi xem ngoài website.");
                return;
              }
              setContactOpen(true);
            }}
            className="group inline-flex items-center justify-center gap-2.5 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl font-bold text-sm sm:text-base text-white bg-[#105d97] hover:bg-[#0d4f82] active:scale-[0.99] transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer"
          >
            <span>{ctaText || "Liên hệ đặt hàng"}</span>
          </button>
        </div>
      </div>

      {/* Popup ContactForm */}
      {contactOpen && !isEditorPreview && (
        <ContactForm
          isModal={true}
          isOpen={contactOpen}
          onClose={() => setContactOpen(false)}
          source="Quy trình đặt hàng Univi"
        />
      )}

      {/* Style hỗ trợ prefers-reduced-motion */}
      <style jsx>{`
        @media (prefers-reduced-motion: reduce) {
          .univi-order-process * {
            animation: none !important;
            transition: none !important;
            transform: none !important;
            opacity: 1 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default UniviOrderProcess;

