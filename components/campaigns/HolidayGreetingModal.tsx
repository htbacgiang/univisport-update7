import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Head from "next/head";
import { useRouter } from "next/router";
import { X, Heart } from "lucide-react";
import styles from "./October20Popup.module.css";

export interface HolidayModalData {
  bannerImage: string;
  bannerAlt: string;
  bannerPosition?: string;
  scriptTagline: string;
  mainTitle: string;
  dateSubtitle: string;
  recipientGreeting: string;
  wishes: string[];
  signature?: string;
  actionText?: string;
  actionCelebratedText?: string;
}

export interface HolidayGreetingModalProps {
  data: HolidayModalData;
  autoCloseSeconds?: number;
  delaySeconds?: number;
  forceShow?: boolean;
  onClose?: () => void;
  onOpen?: () => void;
}

// Chuyển đổi định dạng bannerPosition (dạng '50% 30%', 'object-[center_30%]', 'object-top'...) sang CSS objectPosition chuẩn
export const parseObjectPosition = (pos?: string): string => {
  if (!pos) return "center 30%";
  const clean = pos.trim();
  if (clean.startsWith("object-[")) {
    return clean.replace(/^object-\[/, "").replace(/\]$/, "").replace(/_/g, " ");
  }
  if (clean === "object-top") return "center top";
  if (clean === "object-bottom") return "center bottom";
  if (clean === "object-center") return "center center";
  return clean;
};

// Bắn pháo hoa hoa bay rực rỡ tương tự October20Popup
async function launchGreetingConfetti() {
  if (typeof window === "undefined") return;
  try {
    // @ts-ignore
    const confettiModule = await import("canvas-confetti");
    const confetti: any = confettiModule?.default || confettiModule;

    if (typeof confetti === "function") {
      const colors = ["#105d97", "#0d4c7a", "#38bdf8", "#f59e0b", "#fbbf24", "#e11d48", "#ffffff"];
      confetti({
        particleCount: 80,
        spread: 125,
        startVelocity: 55,
        origin: { x: 0.5, y: 0.75 },
        colors,
        zIndex: 100005,
      });

      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 80,
          startVelocity: 50,
          origin: { x: 0.1, y: 0.8 },
          colors,
          zIndex: 100005,
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 80,
          startVelocity: 50,
          origin: { x: 0.9, y: 0.8 },
          colors,
          zIndex: 100005,
        });
      }, 250);
    }
  } catch (e) {
    console.warn("[HolidayGreetingModal] Confetti error:", e);
  }
}

export const HolidayGreetingModal: React.FC<HolidayGreetingModalProps> = ({
  data,
  autoCloseSeconds = 30,
  delaySeconds = 3,
  forceShow = false,
  onClose,
  onOpen,
}) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [hasCelebrated, setHasCelebrated] = useState(false);
  const [countdown, setCountdown] = useState<number>(autoCloseSeconds);

  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    if (previousActiveElementRef.current && typeof previousActiveElementRef.current.focus === "function") {
      previousActiveElementRef.current.focus();
    }
    onClose?.();
  }, [onClose]);

  // Đếm ngược tự đóng
  useEffect(() => {
    if (!isOpen || typeof window === "undefined" || autoCloseSeconds <= 0) return;
    setCountdown(autoCloseSeconds);

    const interval = window.setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          window.clearInterval(interval);
          handleClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [isOpen, autoCloseSeconds, handleClose]);

  // Delay hiển thị
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (forceShow) {
      const timer = window.setTimeout(() => {
        setIsOpen(true);
        onOpen?.();
      }, 300);
      return () => window.clearTimeout(timer);
    }

    const timer = window.setTimeout(() => {
      if (document.activeElement instanceof HTMLElement) {
        previousActiveElementRef.current = document.activeElement;
      }
      setIsOpen(true);
      onOpen?.();
    }, delaySeconds * 1000);

    return () => window.clearTimeout(timer);
  }, [forceShow, delaySeconds, onOpen]);

  // Khóa cuộn trang & Phím Escape & Focus Trap
  useEffect(() => {
    if (!isOpen || typeof window === "undefined") return;

    const focusTimer = window.setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 50);

    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    const preventOutsideScroll = (e: WheelEvent | TouchEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
        e.preventDefault();
      }
    };

    window.addEventListener("wheel", preventOutsideScroll, { passive: false });
    window.addEventListener("touchmove", preventOutsideScroll, { passive: false });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleClose();
        return;
      }

      if (e.key === "Tab" && dialogRef.current) {
        const focusableElements = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusableElements[0];
        const last = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last?.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first?.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
      window.removeEventListener("wheel", preventOutsideScroll);
      window.removeEventListener("touchmove", preventOutsideScroll);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleClose]);

  const handleAction = () => {
    setHasCelebrated(true);
    launchGreetingConfetti();
  };

  // Cánh hoa rơi trang trí
  const petals = [
    { left: "8%", delay: "0s", duration: "8.5s", size: 14 },
    { left: "22%", delay: "2.1s", duration: "9.2s", size: 18 },
    { left: "38%", delay: "4.3s", duration: "8s", size: 12 },
    { left: "55%", delay: "1.2s", duration: "10s", size: 16 },
    { left: "72%", delay: "3.4s", duration: "8.8s", size: 15 },
    { left: "88%", delay: "0.8s", duration: "9.5s", size: 13 },
  ];

  if (!isOpen) return null;

  return (
    <>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@600;700&family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div
        className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-sm overflow-hidden overscroll-none"
        onClick={handleClose}
      >
        {/* Cánh hoa rơi nhẹ nhàng */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          {petals.map((petal, index) => (
            <span
              key={index}
              className={styles.petal}
              style={{
                left: petal.left,
                animationDelay: petal.delay,
                animationDuration: petal.duration,
                width: `${petal.size}px`,
                height: `${petal.size}px`,
                background: "radial-gradient(circle at 30% 30%, #bae6fd, #38bdf8 70%, #105d97)",
              }}
            />
          ))}
        </div>

        {/* Hộp thiệp: Bố cục giống hệt 100% October20Popup */}
        <div
          ref={dialogRef}
          className={`relative w-full max-w-4xl lg:max-w-6xl max-h-[94vh] sm:max-h-[90vh] md:max-h-[88vh] rounded-2xl overflow-hidden shadow-2xl flex flex-col bg-white border border-[#105d97]/25 ${styles.cardContainer}`}
          role="dialog"
          aria-modal="true"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Nút đóng (×) ở góc trên bên phải */}
          <button
            ref={closeButtonRef}
            onClick={handleClose}
            className="absolute top-3 right-3 sm:top-5 sm:right-5 z-30 p-2.5 sm:p-3 rounded-full bg-white/70 hover:bg-white text-stone-600 hover:text-[#105d97] shadow-lg ring-1 ring-black/5 transition-all duration-200 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#105d97]"
            type="button"
            aria-label="Đóng popup thiệp chúc mừng"
          >
            <X size={22} />
          </button>

          {/* Khung nội dung có thể cuộn linh hoạt trên mobile */}
          <div className={`overflow-y-auto overscroll-contain ${styles.customScrollbar} flex-1`}>
            {/* PHẦN TRÊN: 1 ảnh nền banner duy nhất */}
            <div className="relative w-full h-36 sm:h-44 md:h-48 lg:h-52 overflow-hidden bg-stone-100">
              <Image
                src={data.bannerImage}
                alt={data.bannerAlt}
                fill
                sizes="(max-width: 1200px) 100vw, 1200px"
                className="object-cover"
                style={{ objectPosition: parseObjectPosition(data.bannerPosition) }}
                priority
              />
              {/* Lớp chuyển tiếp sắc thái mềm mại vào thân thiệp */}
              <div className="absolute bottom-0 inset-x-0 h-10 bg-gradient-to-t from-white to-transparent" />
            </div>

            {/* PHẦN GIỮA VÀ DƯỚI: Typography chuẩn October20Popup - Màu chủ đạo #105d97 không gradient */}
            <div className="px-4 sm:px-8 md:px-10 pb-4 sm:pb-5 pt-1.5 sm:pt-2 text-center max-w-5xl lg:max-w-6xl mx-auto">
              {/* 1. Dòng chữ viết tay: font Dancing Script màu #105d97 */}
              <p className={`${styles.dancingScript} text-xl sm:text-2xl font-bold text-[#105d97] tracking-wide mb-0.5`}>
                {data.scriptTagline}
              </p>

              {/* 2. Tiêu đề lớn: font Playfair Display in hoa, MÀU CHỦ ĐẠO #105d97 (KHÔNG GRADIENT) */}
              <h2 className={`${styles.playfairDisplay} text-xl sm:text-2xl md:text-3xl font-extrabold tracking-wider uppercase mb-1 text-[#105d97] drop-shadow-sm`}>
                {data.mainTitle}
              </h2>

              {/* 3. Dòng phụ ngày tháng với dải kim vàng sang trọng */}
              <div className="flex items-center justify-center gap-2 sm:gap-2.5 mb-1.5 sm:mb-2">
                <span className="h-[1px] w-6 sm:w-14 bg-gradient-to-r from-transparent to-amber-500/80" aria-hidden="true" />
                <span className="text-amber-700 font-bold text-xs sm:text-sm tracking-[0.22em] uppercase font-serif">
                  ✦ {data.dateSubtitle} ✦
                </span>
                <span className="h-[1px] w-6 sm:w-14 bg-gradient-to-l from-transparent to-amber-500/80" aria-hidden="true" />
              </div>

              {/* 4. Lời chào gửi trang trọng: mở rộng thoáng mắt */}
              <p className="text-slate-900 font-bold text-sm sm:text-base md:text-lg mb-1.5 sm:mb-2 max-w-4xl lg:max-w-5xl mx-auto leading-snug">
                {data.recipientGreeting}
              </p>

              {/* Đường viền trang trí kẻ ngang */}
              <div className="w-16 sm:w-20 h-0.5 bg-[#105d97]/25 mx-auto mb-2 sm:mb-2.5 rounded-full" aria-hidden="true" />

              {/* 5. Nội dung lời chúc chi tiết */}
              <div className="text-stone-700 text-xs sm:text-sm md:text-base leading-relaxed space-y-1 max-w-4xl lg:max-w-5xl mx-auto text-justify sm:text-center font-normal">
                {data.wishes.map((paragraph, idx) => (
                  <p key={idx} className="transition-opacity duration-200">
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* 6. Phần chữ ký và Logo UniVi */}
              <div className="mt-2.5 sm:mt-3 pt-2 sm:pt-2.5 hidden md:flex border-t border-[#105d97]/20 flex-col sm:flex-row items-center justify-between gap-3 max-w-4xl lg:max-w-5xl mx-auto">
                <div className="flex items-center gap-2">
                  <Image
                    src="/logo-univi.webp"
                    alt="Đồng Phục UniVi"
                    width={130}
                    height={36}
                    className="h-6 sm:h-7 w-auto object-contain opacity-95"
                  />
                </div>
                <p className={`${styles.dancingScript} text-lg sm:text-xl md:text-2xl font-bold text-[#105d97] tracking-wide`}>
                  {data.signature || "Trân trọng, UniVi Sport"}
                </p>
              </div>

              {/* 7. Nút hành động: Màu chủ đạo #105d97 thuần, KHÔNG GRADIENT */}
              <div className="mt-2.5 sm:mt-3 flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
                <button
                  type="button"
                  onClick={handleAction}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 sm:px-6 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold text-white bg-[#105d97] hover:bg-[#0d4c7a] shadow-md transition-all transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#105d97]"
                >
                  <Heart size={16} className={`transition-transform ${hasCelebrated ? "fill-white scale-125" : ""}`} />
                  <span>
                    {hasCelebrated
                      ? data.actionCelebratedText || "Bắn thêm pháo hoa chúc mừng 🌸"
                      : data.actionText || "Gửi ngàn lời chúc yêu thương 🌸"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleClose}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold text-[#105d97] bg-sky-50 hover:bg-sky-100 ring-1 ring-[#105d97]/30 transition-colors focus:outline-none focus:ring-2 focus:ring-[#105d97]"
                >
                  <span>Khép lại thiệp ({countdown}s)</span>
                </button>
              </div>

              <p className="mt-2 text-[11px] text-stone-400">
                Nhấn <kbd className="px-1.5 py-0.5 text-[10px] bg-stone-100 border border-stone-200 rounded font-mono">Esc</kbd> hoặc nhấn ra ngoài để đóng thiệp
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HolidayGreetingModal;
