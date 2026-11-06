"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { FormEvent, ChangeEvent } from "react";
import Image from "next/image";
import { FaTimes, FaShieldAlt, FaClock, FaCheckCircle } from "react-icons/fa";
import { Turnstile, TurnstileInstance } from "@marsidev/react-turnstile";
import { trackLead } from "../../lib/meta-pixel";
import { VIETNAM_PHONE_REGEX, normalizePhone } from "../../lib/validations/contact";

export interface ContactFormProps {
  /** Nguồn traffic / vị trí đặt form */
  source?: string;
  /** Hiển thị dưới dạng Modal / Popup */
  isModal?: boolean;
  /** Trạng thái mở modal (nếu parent kiểm soát thủ công) */
  isOpen?: boolean;
  /** Thời gian tự động đóng (giây) - mặc định 20 giây */
  autoCloseSeconds?: number;
  /** Độ trễ trước khi popup xuất hiện (milliseconds) */
  delayMs?: number;
  /** Có dừng đếm ngược khi người dùng tương tác/điền form không */
  pauseOnInteraction?: boolean;
  /** Tiêu đề popup */
  title?: string;
  /** Phụ đề popup */
  subtitle?: string;
  /** Ép hiển thị popup để kiểm tra / preview */
  forceShow?: boolean;
  /** Callback khi mở popup */
  onOpen?: () => void;
  /** Callback khi đóng popup */
  onClose?: () => void;
  /** Callback khi có tương tác */
  onInteract?: () => void;
  /** Khóa lưu trong storage để ghi nhớ */
  storageKey?: string;
  /** Tần suất: "always" hoặc "once_per_session" */
  displayFrequency?: "always" | "once_per_session";
}

interface FormState {
  name: string;
  phone: string;
  email: string;
  message: string;
  website: string; // Honeypot field
  source: string;
}

interface FormErrors {
  name?: string;
  phone?: string;
  email?: string;
  message?: string;
  turnstile?: string;
  [key: string]: string | undefined;
}

// Biến bộ nhớ ghi nhận trạng thái trong lần tải trang này
let hasDismissedThisPageLoad = false;
let hasOpenedThisPageLoad = false;

if (typeof window !== "undefined") {
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) {
      hasDismissedThisPageLoad = false;
      hasOpenedThisPageLoad = false;
    }
  });
}

export default function ContactForm({
  source = "",
  isModal = false,
  isOpen,
  autoCloseSeconds = 20,
  delayMs = 2000,
  pauseOnInteraction = true,
  title = "Đăng ký tư vấn & Báo giá đồng phục UniVi",
  subtitle = "Nhận bảng giá ưu đãi, catalogue mẫu vải & thiết kế 3D demo miễn phí trong 15 phút!",
  forceShow = false,
  onOpen,
  onClose,
  onInteract,
  storageKey = "univi_contact_popup_dismissed",
  displayFrequency = "always",
}: ContactFormProps) {
  // Trạng thái mở modal nội bộ khi không có prop isOpen truyền vào
  const [internalOpen, setInternalOpen] = useState(false);
  const isCurrentlyOpen = typeof isOpen === "boolean" ? isOpen : internalOpen;

  const [formData, setFormData] = useState<FormState>({
    name: "",
    phone: "",
    email: "",
    message: "",
    website: "", // Honeypot
    source: source || "",
  });

  const [resolvedSource, setResolvedSource] = useState<string>(source || "");
  const [status, setStatus] = useState<string>("");
  const [errors, setErrors] = useState<FormErrors>({});

  // Countdown & Interaction state
  const [countdown, setCountdown] = useState<number>(autoCloseSeconds);
  const [isInteracted, setIsInteracted] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Turnstile state & ref
  const [turnstileToken, setTurnstileToken] = useState<string>("");
  const [turnstileError, setTurnstileError] = useState<string>("");
  const turnstileRef = useRef<TurnstileInstance | null>(null);

  const formRef = useRef<HTMLDivElement | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";

  // Helper to reset Turnstile widget and state
  const resetTurnstile = () => {
    setTurnstileToken("");
    try {
      turnstileRef.current?.reset();
    } catch (e) {
      // widget may not be mounted yet
    }
  };

  const handleClose = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    hasDismissedThisPageLoad = true;
    setInternalOpen(false);

    if (typeof window !== "undefined" && storageKey && displayFrequency === "once_per_session") {
      try {
        sessionStorage.setItem(storageKey, "true");
      } catch {
        // Ignore storage errors
      }
    }
    onClose?.();
  }, [displayFrequency, storageKey, onClose]);

  // Xử lý khi người dùng tương tác với form
  const handleUserInteraction = useCallback(() => {
    onInteract?.();
    if (!pauseOnInteraction) return;
    if (!isInteracted) {
      setIsInteracted(true);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [pauseOnInteraction, isInteracted, onInteract]);

  // Tự động mở popup sau delayMs (nếu dùng dạng popup tự động)
  useEffect(() => {
    if (!isModal || typeof window === "undefined") return;

    if (forceShow) {
      const openTimer = setTimeout(() => {
        setInternalOpen(true);
        setCountdown(autoCloseSeconds);
        setIsInteracted(false);
        onOpen?.();
      }, 300);
      return () => clearTimeout(openTimer);
    }

    // Nếu parent truyền isOpen rõ ràng (như Navbar), không can thiệp delay nội bộ
    if (typeof isOpen === "boolean") {
      if (isOpen) {
        setCountdown(autoCloseSeconds);
        setIsInteracted(false);
      }
      return;
    }

    // Popup tự động chỉ hiển thị duy nhất ở trang chủ
    const currentPath = typeof window !== "undefined" ? window.location.pathname : "";
    if (currentPath !== "/" && currentPath !== "") {
      return;
    }

    if (hasDismissedThisPageLoad || internalOpen || hasOpenedThisPageLoad) {
      return;
    }

    if (displayFrequency === "once_per_session") {
      try {
        if (sessionStorage.getItem(storageKey) === "true") {
          return;
        }
      } catch {
        // Storage unreadable
      }
    }

    const openTimer = setTimeout(() => {
      hasOpenedThisPageLoad = true;
      setInternalOpen(true);
      setCountdown(autoCloseSeconds);
      setIsInteracted(false);
      onOpen?.();
    }, delayMs);

    return () => clearTimeout(openTimer);
  }, [isModal, forceShow, delayMs, autoCloseSeconds, displayFrequency, storageKey, isOpen, internalOpen, onOpen]);

  // Quản lý đếm ngược (Countdown)
  useEffect(() => {
    if (!isModal || !isCurrentlyOpen || typeof window === "undefined") return;
    if (isInteracted) return; // Đã tương tác -> dừng đếm ngược

    setCountdown(autoCloseSeconds);

    if (autoCloseSeconds <= 0) return;

    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isModal, isCurrentlyOpen, autoCloseSeconds, isInteracted, handleClose]);

  // Dynamic source resolver
  useEffect(() => {
    if (source) {
      setResolvedSource(source);
      setFormData((prev) => ({ ...prev, source }));
      return;
    }

    if (typeof window !== "undefined") {
      const path = window.location.pathname;
      let detectedSource = "Website Lead Form";

      if (path === "/" || path === "") {
        detectedSource = "Trang chủ - Form đăng ký";
      } else if (path.includes("/san-pham")) {
        detectedSource = `Trang sản phẩm (${path})`;
      } else if (path.includes("/bo-suu-tap")) {
        detectedSource = `Bộ sưu tập (${path})`;
      } else if (path.includes("/lien-he")) {
        detectedSource = "Trang Liên hệ";
      } else if (path.includes("/bai-viet")) {
        detectedSource = `Bài viết (${path})`;
      } else {
        detectedSource = `Trang ${path}`;
      }

      setResolvedSource(detectedSource);
      setFormData((prev) => ({ ...prev, source: detectedSource }));
    }
  }, [source]);

  // Entrance animation observer
  useEffect(() => {
    const currentFormRef = formRef.current;
    if (!currentFormRef) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.setAttribute(
              "style",
              "animation: cfSlideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;"
            );
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    observer.observe(currentFormRef);
    return () => {
      observer.unobserve(currentFormRef);
    };
  }, []);

  // Modal event listeners (Escape, Tab focus trapping)
  useEffect(() => {
    if (!isModal || !isCurrentlyOpen) return;
    const modal = modalRef.current;
    const focusables = modal?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusables?.[0];
    const last = focusables?.[focusables.length - 1];

    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    const onTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };

    window.addEventListener("keydown", onEscape);
    modal?.addEventListener("keydown", onTab);
    return () => {
      window.removeEventListener("keydown", onEscape);
      modal?.removeEventListener("keydown", onTab);
    };
  }, [isModal, isCurrentlyOpen, handleClose]);

  // Modal body scroll lock
  useEffect(() => {
    if (!isModal) return;
    const html = document.documentElement;
    if (isCurrentlyOpen) {
      html.style.overflow = "hidden";
      html.style.overscrollBehavior = "contain";
      document.body.style.overflow = "hidden";
      document.body.style.overscrollBehavior = "contain";
      document.body.style.touchAction = "none";
    } else {
      html.style.overflow = "";
      html.style.overscrollBehavior = "";
      document.body.style.overflow = "";
      document.body.style.overscrollBehavior = "";
      document.body.style.touchAction = "";
    }
  }, [isModal, isCurrentlyOpen]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Vui lòng nhập họ và tên";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Họ và tên phải có ít nhất 2 ký tự";
    }

    const cleanPhone = normalizePhone(formData.phone);
    if (!cleanPhone) {
      newErrors.phone = "Vui lòng nhập số điện thoại";
    } else if (!VIETNAM_PHONE_REGEX.test(cleanPhone)) {
      newErrors.phone = "Số điện thoại không hợp lệ (VD: 0987654321 hoặc 0834.204.999)";
    }

    if (
      formData.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())
    ) {
      newErrors.email = "Email không đúng định dạng";
    }

    if (formData.message.length > 1000) {
      newErrors.message = "Nội dung không được vượt quá 1000 ký tự";
    }

    if (!turnstileToken) {
      newErrors.turnstile = "Vui lòng xác minh bảo mật bên dưới";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    handleUserInteraction();
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 1. Honeypot check on client side
    if (formData.website) {
      console.warn("Spam detected");
      return;
    }

    // 2. Validate input fields and Turnstile token
    if (!validateForm()) return;

    setStatus("Đang gửi...");

    try {
      const payload = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        message: formData.message.trim(),
        source: resolvedSource,
        website: formData.website, // honeypot
        "cf-turnstile-response": turnstileToken,
        turnstileToken: turnstileToken,
      };

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        trackLead({
          content_name: "Form đăng ký tư vấn & báo giá",
          source: resolvedSource,
          phone_provided: Boolean(formData.phone),
          email_provided: Boolean(formData.email),
        });

        setStatus(
          result.message ||
          "Gửi yêu cầu thành công! Chúng tôi sẽ liên hệ lại sớm nhất."
        );
        setFormData({
          name: "",
          phone: "",
          email: "",
          message: "",
          website: "",
          source: source || "",
        });
        setErrors({});
        setTurnstileError("");

        // Reset turnstile token upon success
        resetTurnstile();

        setTimeout(() => setStatus(""), 6000);
      } else {
        const errorMsg =
          result.message ||
          (result.errors ? Object.values(result.errors)[0] : "Không thể gửi yêu cầu");
        setStatus(`Lỗi: ${errorMsg}`);

        if (result.errors) {
          setErrors(result.errors);
        }

        // Reset turnstile on error so user can re-verify
        resetTurnstile();
      }
    } catch (err: any) {
      setStatus("Lỗi kết nối máy chủ. Vui lòng thử lại hoặc liên hệ qua hotline.");
      resetTurnstile();
    }
  };

  const inputBase =
    "w-full bg-white border border-gray-200 rounded-lg px-3.5 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#105d97] focus:ring-1 focus:ring-[#105d97]/20 transition-colors duration-200";

  const progressPercent = Math.max(0, Math.min(100, (countdown / autoCloseSeconds) * 100));

  const formContent = (
    <section
      className={`${isModal ? "bg-transparent p-0" : "bg-[#f3f3f0] py-6 px-6 md:px-6"
        } font-sans`}
    >
      <div
        ref={formRef}
        className={`cf-animate mx-auto grid grid-cols-1 md:grid-cols-[1fr_1.5fr] gap-6 md:gap-10 items-start ${isModal ? "max-w-full p-1 sm:p-4" : "max-w-[1100px]"
          }`}
      >
        {/* ── LEFT: info + image ── */}
        <div className="hidden md:flex flex-col gap-6">
          <div className="relative rounded-2xl overflow-hidden aspect-[3/4]">
            <Image
              src="/images/dong-phuc-cong-ty.webp"
              alt="UniviSport showroom"
              fill
              sizes="(max-width: 1100px) 35vw, 380px"
              className="object-cover"
              priority
            />
          </div>
        </div>

        {/* ── RIGHT: form ── */}
        <div>
          <form
            onSubmit={handleSubmit}
            role="form"
            className="flex flex-col gap-3 sm:gap-4 md:gap-[18px]"
          >
            {/* Honeypot field - hidden from human users */}
            <div
              className="hidden"
              aria-hidden="true"
              style={{ display: "none" }}
            >
              <label htmlFor="form-website-field">Website</label>
              <input
                id="form-website-field"
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                value={formData.website}
                onChange={handleChange}
              />
            </div>

            {/* Row 1: Họ tên + Điện thoại */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="flex flex-col gap-1 sm:gap-1.5">
                <label
                  htmlFor="name"
                  className="text-xs sm:text-[13px] font-medium text-gray-600"
                >
                  Họ và Tên <span className="text-[#105d97]">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  onFocus={handleUserInteraction}
                  onClick={handleUserInteraction}
                  placeholder="Nguyễn Văn A"
                  className={`${inputBase} ${errors.name ? "border-red-400" : ""
                    }`}
                />
                {errors.name && (
                  <p className="text-xs text-red-500">{errors.name}</p>
                )}
              </div>

              <div className="flex flex-col gap-1 sm:gap-1.5">
                <label
                  htmlFor="phone"
                  className="text-xs sm:text-[13px] font-medium text-gray-600"
                >
                  Điện thoại <span className="text-[#105d97]">*</span>
                </label>
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  onFocus={handleUserInteraction}
                  onClick={handleUserInteraction}
                  placeholder="0987 654 321"
                  className={`${inputBase} ${errors.phone ? "border-red-400" : ""
                    }`}
                />
                {errors.phone && (
                  <p className="text-xs text-red-500">{errors.phone}</p>
                )}
              </div>
            </div>

            {/* Row 2: Email */}
            <div className="flex flex-col gap-1 sm:gap-1.5">
              <label
                htmlFor="email"
                className="text-xs sm:text-[13px] font-medium text-gray-600"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onFocus={handleUserInteraction}
                onClick={handleUserInteraction}
                placeholder="example@domain.com"
                className={`${inputBase} ${errors.email ? "border-red-400" : ""
                  }`}
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Row 3: Lời nhắn */}
            <div className="flex flex-col gap-1 sm:gap-1.5">
              <label
                htmlFor="message"
                className="text-xs sm:text-[13px] font-medium text-gray-600"
              >
                Lời nhắn
              </label>
              <textarea
                id="message"
                name="message"
                rows={3}
                value={formData.message}
                onChange={handleChange}
                onFocus={handleUserInteraction}
                onClick={handleUserInteraction}
                placeholder="Nhập yêu cầu tư vấn mẫu áo, chất liệu, số lượng..."
                className={`${inputBase} resize-none ${errors.message ? "border-red-400" : ""
                  }`}
              />
              {errors.message && (
                <p className="text-xs text-red-500">{errors.message}</p>
              )}
            </div>

            {/* Turnstile Widget */}
            <div className="flex flex-col gap-1 min-h-[65px] justify-center">
              {siteKey ? (
                <Turnstile
                  ref={turnstileRef}
                  siteKey={siteKey}
                  onSuccess={(token) => {
                    setTurnstileToken(token);
                    setTurnstileError("");
                    if (errors.turnstile) {
                      setErrors((prev) => ({ ...prev, turnstile: undefined }));
                    }
                  }}
                  onError={(errorCode) => {
                    setTurnstileToken("");
                    setTurnstileError("Xác minh thất bại. Vui lòng thử lại.");
                  }}
                  onExpire={() => {
                    setTurnstileToken("");
                  }}
                  options={{
                    theme: "light",
                    size: "normal",
                    language: "vi",
                  }}
                />
              ) : (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                  Turnstile Site Key chưa được cấu hình.
                </div>
              )}
              {errors.turnstile && (
                <p className="text-xs text-red-500 font-medium">
                  {errors.turnstile}
                </p>
              )}
              {turnstileError && !errors.turnstile && (
                <p className="text-xs text-red-500 font-medium">
                  {turnstileError}
                </p>
              )}
            </div>

            {/* Submit button */}
            <div className="flex flex-col sm:flex-row items-center justify-between pt-1 gap-2">
              <span className="text-[11px] text-gray-400 hidden sm:inline">
                * Thông tin bắt buộc
              </span>
              <div className="w-full sm:w-auto">
                <button
                  type="submit"
                  disabled={status === "Đang gửi..." || !turnstileToken}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-gray-900 border-2 border-gray-200 rounded-full px-5 py-2 sm:px-6 sm:py-2.5 text-xs sm:text-sm font-semibold cursor-pointer transition-all duration-200 hover:border-[#105d97] hover:text-[#105d97] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  <span>{status === "Đang gửi..." ? "Đang gửi..." : "Gửi tin nhắn"}</span>
                  {status !== "Đang gửi..." && (
                    <span className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#105d97] text-white flex-shrink-0">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        />
                      </svg>
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Status message */}
            {status && status !== "Đang gửi..." && (
              <p
                className={`text-[13px] font-medium px-4 py-3 rounded-lg border-l-4 ${status.includes("thành công")
                  ? "bg-green-50 border-green-500 text-green-700"
                  : "bg-red-50 border-red-500 text-red-700"
                  }`}
              >
                {status}
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  );

  return (
    <>
      <style>{`
        @keyframes cfSlideUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .cf-animate {
          animation: cfSlideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
      `}</style>

      {isModal ? (
        isCurrentlyOpen && (
          <div
            className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/60 backdrop-blur-sm transition-all duration-300"
            onClick={(e) => {
              if (e.target === e.currentTarget) handleClose();
            }}
            role="dialog"
            aria-modal="true"
            aria-label="Tư vấn đồng phục UniVi"
          >
            <div
              ref={modalRef}
              className="relative w-full max-w-5xl max-h-[96vh] sm:max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Thanh đếm ngược tiến trình ở mép trên cùng */}
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 sm:h-1.5 overflow-hidden">
                <div
                  className={`h-full transition-all duration-1000 linear ${isInteracted
                    ? "bg-emerald-500 w-full"
                    : "bg-gradient-to-r from-[#105d97] via-cyan-500 to-amber-400"
                    }`}
                  style={{ width: isInteracted ? "100%" : `${progressPercent}%` }}
                />
              </div>

              {/* Header Modal UniVi sang trọng */}
              <div className="relative px-3 sm:px-6 py-2.5 sm:py-3.5 bg-gradient-to-r from-slate-900 via-[#0d4c7a] to-[#105d97] text-white flex items-center justify-between gap-2 sm:gap-3 shadow-md shrink-0">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <div className="relative hidden md:block w-20 sm:w-24 h-7 sm:h-8 shrink-0 rounded-lg p-1 backdrop-blur-sm">
                    <Image
                      src="/logo-univi.webp"
                      alt="Đồng Phục UniVi"
                      fill
                      className="object-contain"
                      priority
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xs sm:text-base md:text-lg font-bold tracking-tight text-white leading-tight truncate sm:whitespace-normal">
                      {title}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-sky-100/90 hidden sm:block truncate">
                      {subtitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                  {/* Huy hiệu đếm ngược / Tương tác */}
                  {isInteracted ? (
                    <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 animate-pulse">
                      <FaCheckCircle className="text-emerald-400 text-[10px] sm:text-xs" />
                      <span>Đang điền</span>
                    </span>
                  ) : (
                    <span
                      className="inline-flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium bg-white/15 text-white border border-white/20 backdrop-blur-sm shadow-sm"
                      title="Sẽ tự động đóng sau khi hết đếm ngược nếu chưa điền form"
                    >
                      <FaClock className="text-amber-300 animate-spin-slow text-[10px] sm:text-xs" />
                      <span>
                        <span className="hidden sm:inline">Tự đóng sau </span>
                        <strong className="font-bold text-amber-300 text-xs sm:text-sm">
                          {countdown}s
                        </strong>
                      </span>
                    </span>
                  )}

                  {/* Nút đóng góc phải */}
                  <button
                    type="button"
                    onClick={handleClose}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 text-white transition-transform hover:rotate-90 duration-200"
                    aria-label="Đóng popup"
                  >
                    <FaTimes size={14} className="sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>

              {/* Thanh ghi chú nhanh bảo mật & hỗ trợ */}
              <div className="bg-sky-50 dark:bg-slate-800/80 px-3 py-1.5 sm:px-4 sm:py-2 border-b border-sky-100 dark:border-slate-800 flex items-center justify-between text-[10px] sm:text-xs text-slate-600 dark:text-slate-300 gap-2 shrink-0">
                <div className="flex items-center gap-1.5 text-[#105d97] dark:text-sky-400 font-medium truncate">
                  <FaShieldAlt className="shrink-0 text-xs" />
                  <span className="truncate">Bảo mật 100% • Thiết kế 3D miễn phí • Hotline: 0834.204.999</span>
                </div>
                {isInteracted ? (
                  <span className="text-emerald-700 dark:text-emerald-400 font-medium shrink-0">
                    ✓ Đã dừng đếm ngược
                  </span>
                ) : (
                  <span className="text-slate-400 shrink-0 hidden sm:inline">
                    Chạm vào ô nhập để giữ popup
                  </span>
                )}
              </div>

              {/* Nội dung ContactForm */}
              <div className="overflow-y-auto flex-1 p-1.5 sm:p-4 md:p-6 bg-slate-50 dark:bg-slate-950">
                <div className="bg-white dark:bg-slate-900 rounded-lg sm:rounded-xl p-2.5 sm:p-4 shadow-sm border border-slate-100 dark:border-slate-800">
                  {formContent}
                </div>
              </div>
            </div>
          </div>
        )
      ) : (
        formContent
      )}
    </>
  );
}
