import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Image from "next/image";
import {
  Calendar,
  Clock,
  Save,
  Plus,
  Trash2,
  Eye,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  RefreshCw,
  Sliders,
  Gift,
  ArrowRight,
  ShieldCheck,
  PauseCircle,
  X,
  Play,
  ExternalLink,
  SlidersHorizontal,
  Edit3,
  Upload,
  Image as ImageIcon,
  FileText,
  RotateCcw,
  Folder,
  Move,
  Smartphone,
  Monitor,
  Heart,
} from "lucide-react";
import AdminLayout from "../../../components/layout/AdminLayout";
import popupStyles from "../../../components/campaigns/October20Popup.module.css";
import R2ImageModal, { R2ImageSelectionResult } from "../../../components/editor/R2ImageModal";
import { ContactFormPopup } from "../../../components/campaigns/ContactFormPopup";
import { October20Popup } from "../../../components/campaigns/October20Popup";
import { HolidayFestivePopup } from "../../../components/campaigns/HolidayFestivePopup";
import { TetHolidayPopup } from "../../../components/campaigns/TetHolidayPopup";
import { WomenDay83Popup } from "../../../components/campaigns/WomenDay83Popup";
import { VictoryDay304Popup } from "../../../components/campaigns/VictoryDay304Popup";
import { NationalDay29Popup } from "../../../components/campaigns/NationalDay29Popup";
import { TeachersDay2011Popup } from "../../../components/campaigns/TeachersDay2011Popup";
import { XmasNewYearPopup } from "../../../components/campaigns/XmasNewYearPopup";
import { DEFAULT_POPUP_SETTINGS } from "../../../data/defaultPopupSettings";
import { getHolidayDefaultTemplate } from "../../../data/holidayTemplates";
import { isHolidayActive, normalizePopupConfig, resolveActivePopup } from "../../../lib/popup-helper";
import type {
  PopupSettingsConfig,
  HolidayPopupConfig,
  ActivePopupResolved,
} from "../../../types/popup";

// Helper chuyển đổi chuỗi position thành { x, y } (từ 0 đến 100%)
const parsePositionCoords = (pos?: string): { x: number; y: number } => {
  if (!pos) return { x: 50, y: 30 };
  let clean = pos.trim();
  if (clean.startsWith("object-[")) {
    clean = clean.replace(/^object-\[/, "").replace(/\]$/, "").replace(/_/g, " ");
  }
  if (clean === "object-top" || clean === "center top" || clean === "top") return { x: 50, y: 0 };
  if (clean === "object-bottom" || clean === "center bottom" || clean === "bottom") return { x: 50, y: 100 };
  if (clean === "object-center" || clean === "center center" || clean === "center") return { x: 50, y: 50 };

  const parts = clean.split(/\s+/);
  if (parts.length === 2) {
    let x = 50;
    let y = 50;
    if (parts[0] === "center") x = 50;
    else if (parts[0] === "left") x = 0;
    else if (parts[0] === "right") x = 100;
    else {
      const matchX = parts[0].match(/(-?\d+(\.\d+)?)/);
      if (matchX) x = parseFloat(matchX[1]);
    }

    if (parts[1] === "center") y = 50;
    else if (parts[1] === "top") y = 0;
    else if (parts[1] === "bottom") y = 100;
    else {
      const matchY = parts[1].match(/(-?\d+(\.\d+)?)/);
      if (matchY) y = parseFloat(matchY[1]);
    }

    return {
      x: Math.min(100, Math.max(0, Math.round(x))),
      y: Math.min(100, Math.max(0, Math.round(y))),
    };
  }
  return { x: 50, y: 30 };
};

interface BannerPositionEditorProps {
  imageSrc: string;
  position?: string;
  onChange: (newPosition: string) => void;
}

// Component kéo thả trực quan vị trí ảnh Banner (Hỗ trợ chuột, cảm ứng, phím tắt & slider)
const BannerPositionInteractiveEditor: React.FC<BannerPositionEditorProps> = ({
  imageSrc,
  position,
  onChange,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const dragStartRef = useRef<{ startX: number; startY: number; startCoords: { x: number; y: number } }>({
    startX: 0,
    startY: 0,
    startCoords: { x: 50, y: 30 },
  });

  const coords = parsePositionCoords(position);
  const cssPosition = `${coords.x}% ${coords.y}%`;

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startCoords: coords,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const width = rect.width || 400;
    const height = rect.height || 180;

    const deltaX = e.clientX - dragStartRef.current.startX;
    const deltaY = e.clientY - dragStartRef.current.startY;

    // Kéo ảnh sang trái -> khung nhìn sang phải (X tăng), kéo ảnh lên trên -> khung nhìn xuống dưới (Y tăng)
    const newX = Math.min(100, Math.max(0, Math.round(dragStartRef.current.startCoords.x - (deltaX / width) * 100)));
    const newY = Math.min(100, Math.max(0, Math.round(dragStartRef.current.startCoords.y - (deltaY / height) * 100)));

    onChange(`${newX}% ${newY}%`);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch (err) {}
    }
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
          <Move size={14} className="text-[#105d97]" />
          <span>Kéo thả để chỉnh vị trí của ảnh:</span>
        </label>
        <span className="text-[11px] font-mono px-2 py-0.5 bg-sky-50 dark:bg-sky-950/60 text-[#105d97] dark:text-sky-300 font-bold rounded border border-sky-100 dark:border-sky-900">
          X: {coords.x}% | Y: {coords.y}%
        </span>
      </div>

      {/* Khung ảnh cho phép kéo thả trực tiếp */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`relative w-full h-40 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 border-2 select-none touch-none transition-all ${
          isDragging
            ? "cursor-grabbing border-[#105d97] ring-4 ring-sky-200 dark:ring-sky-900/60 shadow-lg"
            : "cursor-grab border-gray-300 dark:border-gray-600 hover:border-[#105d97] hover:shadow-md"
        }`}
        title="Nhấp chuột và kéo để dịch chuyển vùng nhìn ảnh"
      >
        <Image
          src={imageSrc}
          alt="Banner Position Drag"
          fill
          draggable={false}
          className="object-cover pointer-events-none transition-none"
          style={{ objectPosition: cssPosition }}
        />

        {/* Lớp chuyển tiếp sắc thái mềm mại vào thân thiệp mô phỏng popup thật */}
        <div className="absolute bottom-0 inset-x-0 h-8 bg-gradient-to-t from-white/80 dark:from-gray-900/80 to-transparent pointer-events-none" />

        {/* HUD chỉ dẫn tương tác */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 hover:opacity-100 transition-opacity">
          {!isDragging && (
            <div className="px-3 py-1.5 bg-black/75 backdrop-blur-sm text-white text-xs rounded-full shadow-lg flex items-center gap-1.5 animate-pulse">
              <Move size={13} />
              <span>Nhấp & kéo để chỉnh vị trí</span>
            </div>
          )}
        </div>

        {isDragging && (
          <div className="absolute top-2 left-2 px-2.5 py-1 bg-[#105d97]/90 text-white text-[11px] font-bold rounded-md shadow-md flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Đang kéo: {coords.x}% - {coords.y}%</span>
          </div>
        )}

        <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/60 backdrop-blur-sm text-white/90 text-[10px] font-medium rounded">
          🖐️ Kéo để di chuyển
        </div>
      </div>

      {/* Thanh trượt tinh chỉnh nhanh trục Y (Độ cao tiêu điểm) */}
      <div className="space-y-1 pt-1">
        <div className="flex items-center justify-between text-[11px] text-gray-500">
          <span>Trục Dọc (Cao độ Y):</span>
          <span className="font-semibold text-gray-700 dark:text-gray-300">{coords.y}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={coords.y}
          onChange={(e) => onChange(`${coords.x}% ${e.target.value}%`)}
          className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#105d97]"
        />
        <div className="flex justify-between text-[10px] text-gray-400 px-0.5">
          <span>0% (Đỉnh ảnh)</span>
          <span>50% (Chính giữa)</span>
          <span>100% (Đáy ảnh)</span>
        </div>
      </div>

      {/* 4 Nút căn nhanh (Presets) */}
      <div className="pt-1">
        <div className="text-[11px] font-medium text-gray-500 mb-1.5">Căn nhanh vị trí tiêu chuẩn:</div>
        <div className="grid grid-cols-4 gap-1.5 text-[11px]">
          <button
            type="button"
            onClick={() => onChange("50% 0%")}
            className={`px-2 py-1.5 rounded-lg border text-center transition ${
              coords.y === 0
                ? "bg-[#105d97] text-white border-[#105d97] font-bold"
                : "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-sky-50"
            }`}
          >
            Đỉnh ảnh
          </button>
          <button
            type="button"
            onClick={() => onChange("50% 30%")}
            className={`px-2 py-1.5 rounded-lg border text-center transition ${
              coords.y === 30 && coords.x === 50
                ? "bg-[#105d97] text-white border-[#105d97] font-bold"
                : "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-sky-50"
            }`}
          >
            Top 30% ⭐
          </button>
          <button
            type="button"
            onClick={() => onChange("50% 50%")}
            className={`px-2 py-1.5 rounded-lg border text-center transition ${
              coords.y === 50 && coords.x === 50
                ? "bg-[#105d97] text-white border-[#105d97] font-bold"
                : "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-sky-50"
            }`}
          >
            Chính giữa
          </button>
          <button
            type="button"
            onClick={() => onChange("50% 100%")}
            className={`px-2 py-1.5 rounded-lg border text-center transition ${
              coords.y === 100
                ? "bg-[#105d97] text-white border-[#105d97] font-bold"
                : "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-sky-50"
            }`}
          >
            Đáy ảnh
          </button>
        </div>
      </div>
    </div>
  );
};

export default function PopupSettingsAdminPage() {
  const [config, setConfig] = useState<PopupSettingsConfig>(() =>
    normalizePopupConfig(DEFAULT_POPUP_SETTINGS)
  );
  const [resolved, setResolved] = useState<ActivePopupResolved>(() =>
    resolveActivePopup(normalizePopupConfig(DEFAULT_POPUP_SETTINGS))
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Preview state linh hoạt: hỗ trợ xem thử bất kỳ popup nào (ContactForm hoặc ngày lễ bất kỳ)
  const [previewTarget, setPreviewTarget] = useState<{
    type: "contact_form" | "holiday";
    holidayKey?: string;
    holiday?: HolidayPopupConfig | null;
  } | null>(null);

  // Lựa chọn popup muốn test trong Playground
  const [selectedTestPopup, setSelectedTestPopup] = useState<string>("contact_form");

  // State chỉnh sửa ảnh và nội dung ngày lễ
  const [editingHoliday, setEditingHoliday] = useState<HolidayPopupConfig | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [wishesText, setWishesText] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Tab chế độ trong Modal chỉnh sửa: 'edit' (chỉnh sửa) hoặc 'preview' (xem trước popup sau khi sửa)
  const [editModalTab, setEditModalTab] = useState<"edit" | "preview">("edit");
  // Chế độ thiết bị khi xem trước popup: 'desktop' hoặc 'mobile'
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");

  // Bắn pháo hoa thử nghiệm khi xem trước
  const handleTriggerTestConfetti = async () => {
    try {
      // @ts-ignore
      const confetti = (await import("canvas-confetti")).default;
      confetti({
        particleCount: 75,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#105d97", "#38bdf8", "#f43f5e", "#fbbf24", "#10b981", "#8b5cf6"],
      });
      toast.success("Bắn pháo hoa chúc mừng thành công! 🎉");
    } catch (e) {
      toast.success("Chúc mừng ngày lễ! 🎉");
    }
  };

  // Cloudflare R2 Modal state (mặc định thư mục thumbnail)
  const [showR2Modal, setShowR2Modal] = useState(false);
  const [r2InitialTab, setR2InitialTab] = useState<"manage" | "upload">("upload");
  const [r2InitialFile, setR2InitialFile] = useState<File | null>(null);
  const [r2TargetForNew, setR2TargetForNew] = useState(false);

  // New Holiday modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newHoliday, setNewHoliday] = useState<Partial<HolidayPopupConfig>>({
    name: "",
    description: "",
    enabled: true,
    startDate: new Date().toISOString().slice(0, 16),
    endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    autoCloseSeconds: 30,
    delaySeconds: 3,
    componentKey: "october20",
    activeDays: 3,
    priority: 5,
  });

  // Tải cấu hình từ API
  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/popup-settings");
      if (data?.config) {
        const normalized = normalizePopupConfig(data.config);
        setConfig(normalized);
        setResolved(data.resolved || resolveActivePopup(normalized));
      }
    } catch (err: any) {
      toast.error(err.response?.data?.err || "Không thể tải cấu hình Popup");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Cập nhật resolved status mỗi khi config thay đổi
  useEffect(() => {
    setResolved(resolveActivePopup(config));
  }, [config]);

  // Cập nhật cấu hình testMode
  const updateTestMode = (field: string, value: any) => {
    setConfig((prev) => ({
      ...prev,
      testMode: {
        ...(prev.testMode || {
          enabled: false,
          overrideType: "auto",
          forcedHolidayId: "ngay_20_10",
          ignoreSchedule: true,
          forceShowImmediately: false,
        }),
        [field]: value,
      },
    }));
  };

  // Lưu cấu hình về DB
  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await axios.put("/api/popup-settings", { config });
      if (data?.config) {
        const normalized = normalizePopupConfig(data.config);
        setConfig(normalized);
        setResolved(data.resolved || resolveActivePopup(normalized));
      }
      toast.success(data?.message || "Đã lưu cài đặt Popup thành công!");
    } catch (err: any) {
      toast.error(err.response?.data?.err || "Lỗi khi lưu cấu hình Popup");
    } finally {
      setSaving(false);
    }
  };

  // Xử lý upload ảnh cho popup vào Cloudflare R2 (thư mục thumbnail)
  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>, isForNewModal = false) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setUploadingImage(true);

    try {
      let uploadedUrl = "";

      // 1. Thử lấy Presigned URL và tải trực tiếp lên Cloudflare R2 vào thư mục thumbnail
      try {
        const { data: presigned } = await axios.post("/api/r2/upload", {
          filename: file.name,
          contentType: file.type || "application/octet-stream",
          folder: "thumbnail",
        });

        if (presigned?.uploadUrl) {
          await axios.put(presigned.uploadUrl, file, {
            headers: { "Content-Type": file.type || "application/octet-stream" },
          });
          uploadedUrl = presigned.publicUrl;
        }
      } catch (presignedErr) {
        // 2. Thử Proxy upload qua backend vào thư mục thumbnail trên R2
        try {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("folder", "thumbnail");

          const { data: proxyData } = await axios.post("/api/r2/upload-proxy", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });

          if (proxyData?.publicUrl) {
            uploadedUrl = proxyData.publicUrl;
          }
        } catch (proxyErr) {
          // Tiếp tục fallback bên dưới nếu R2 proxy cũng lỗi
        }
      }

      // 3. Fallback: Nếu môi trường chưa cấu hình R2, dùng /api/upload
      if (!uploadedUrl) {
        const fallbackData = new FormData();
        fallbackData.append("file", file);
        const res = await axios.post("/api/upload", fallbackData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        uploadedUrl = res.data?.links?.[0];
      }

      if (uploadedUrl) {
        if (isForNewModal) {
          setNewHoliday((prev) => ({ ...prev, bannerImage: uploadedUrl }));
        } else if (editingHoliday) {
          setEditingHoliday((prev) => (prev ? { ...prev, bannerImage: uploadedUrl } : null));
        }
        toast.success("Tải ảnh lên thư mục thumbnail của R2 thành công!");
      } else {
        throw new Error("Không nhận được đường dẫn ảnh sau khi tải lên");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.message || "Không thể tải ảnh lên R2");
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  // Helper phân tách các đoạn văn từ textarea một cách tự nhiên (cho phép dịch câu lên cùng 1 dòng)
  const parseWishesIntoParagraphs = (text: string): string[] => {
    if (!text || !text.trim()) return [];
    // Phân tách theo các đoạn có cách dòng trống (2 lần Enter). Các câu trong cùng một đoạn được giữ liền mạch trên cùng 1 dòng
    const blocks = text.split(/\n\s*\n+/);
    return blocks
      .map((b) => b.replace(/\r?\n+/g, " ").trim())
      .filter(Boolean);
  };

  // Mở modal chỉnh sửa nội dung và ảnh của ngày lễ
  const openEditHolidayModal = (index: number) => {
    const item = config.holidays[index];
    const defaultTpl = getHolidayDefaultTemplate(item.componentKey, item.name);
    const initialWishes = item.wishes && item.wishes.length > 0 ? item.wishes : defaultTpl.wishes;

    // Mặc định tự động lấy nội dung mẫu chuẩn nếu chưa được cấu hình
    setEditingHoliday({
      ...item,
      bannerImage: item.bannerImage || defaultTpl.bannerImage,
      bannerAlt: item.bannerAlt || defaultTpl.bannerAlt,
      bannerPosition: item.bannerPosition || defaultTpl.bannerPosition,
      scriptTagline: item.scriptTagline || defaultTpl.scriptTagline,
      mainTitle: item.mainTitle || defaultTpl.mainTitle,
      dateSubtitle: item.dateSubtitle || defaultTpl.dateSubtitle,
      recipientGreeting: item.recipientGreeting || defaultTpl.recipientGreeting,
      wishes: initialWishes,
      signature: item.signature || defaultTpl.signature,
      actionText: item.actionText || defaultTpl.actionText,
    });
    // Hiển thị các đoạn văn cách nhau bằng một dòng trống
    setWishesText(Array.isArray(initialWishes) ? initialWishes.join("\n\n") : String(initialWishes || ""));
    setEditingIndex(index);
    setEditModalTab("edit");
    setPreviewDevice("desktop");
  };

  // Khôi phục toàn bộ nội dung mẫu mặc định cho ngày lễ đang chỉnh sửa
  const handleResetToDefaultTemplate = () => {
    if (!editingHoliday) return;
    const defaultTpl = getHolidayDefaultTemplate(editingHoliday.componentKey, editingHoliday.name);
    setEditingHoliday((prev) =>
      prev
        ? {
            ...prev,
            bannerImage: defaultTpl.bannerImage,
            bannerAlt: defaultTpl.bannerAlt,
            bannerPosition: defaultTpl.bannerPosition,
            scriptTagline: defaultTpl.scriptTagline,
            mainTitle: defaultTpl.mainTitle,
            dateSubtitle: defaultTpl.dateSubtitle,
            recipientGreeting: defaultTpl.recipientGreeting,
            wishes: defaultTpl.wishes,
            signature: defaultTpl.signature,
            actionText: defaultTpl.actionText,
          }
        : null
    );
    setWishesText(defaultTpl.wishes.join("\n\n"));
    toast.success("Đã khôi phục toàn bộ hình ảnh và nội dung mẫu mặc định!");
  };

  // Cập nhật trường của editingHoliday
  const updateEditingHolidayField = (field: keyof HolidayPopupConfig, value: any) => {
    setEditingHoliday((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  // Lưu chỉnh sửa nội dung và ảnh của ngày lễ - LƯU TRỰC TIẾP VÀO DATABASE
  const handleSaveHolidayContent = async () => {
    if (editingIndex === null || !editingHoliday) return;

    const finalParagraphs = parseWishesIntoParagraphs(wishesText);

    const holidayToSave: HolidayPopupConfig = {
      ...editingHoliday,
      wishes: finalParagraphs.length > 0 ? finalParagraphs : editingHoliday.wishes,
    };

    const updatedHolidays = [...config.holidays];
    updatedHolidays[editingIndex] = holidayToSave;

    const newConfig: PopupSettingsConfig = {
      ...config,
      holidays: updatedHolidays,
    };

    setConfig(newConfig);
    setEditingHoliday(null);
    setEditingIndex(null);

    // Lưu thẳng vào cơ sở dữ liệu qua API
    setSaving(true);
    try {
      const { data } = await axios.put("/api/popup-settings", { config: newConfig });
      if (data?.config) {
        const normalized = normalizePopupConfig(data.config);
        setConfig(normalized);
        setResolved(data.resolved || resolveActivePopup(normalized));
      }
      toast.success("Đã lưu nội dung và hình ảnh ngày lễ thành công!");
    } catch (err: any) {
      toast.error(err.response?.data?.err || "Lỗi khi lưu cấu hình vào cơ sở dữ liệu");
    } finally {
      setSaving(false);
    }
  };

  // Cập nhật cấu hình Default Popup
  const updateDefaultPopup = (field: string, value: any) => {
    setConfig((prev) => ({
      ...prev,
      defaultPopup: {
        ...prev.defaultPopup,
        [field]: value,
      },
    }));
  };

  // Toggle trạng thái của 1 ngày lễ
  const toggleHoliday = (index: number) => {
    setConfig((prev) => {
      const updated = [...prev.holidays];
      updated[index] = { ...updated[index], enabled: !updated[index].enabled };
      return { ...prev, holidays: updated };
    });
  };

  // Cập nhật trường của 1 ngày lễ
  const updateHoliday = (index: number, field: keyof HolidayPopupConfig, value: any) => {
    setConfig((prev) => {
      const updated = [...prev.holidays];
      const item = { ...updated[index], [field]: value };

      // Nếu cập nhật startDate hoặc activeDays -> tự động tính lại endDate
      if (field === "startDate" || field === "activeDays") {
        try {
          const start = new Date(field === "startDate" ? value : item.startDate);
          const days = Number(field === "activeDays" ? value : item.activeDays) || 1;
          const end = new Date(start.getTime() + days * 24 * 60 * 60 * 1000);
          item.endDate = end.toISOString();
        } catch {
          // Keep as is
        }
      }

      updated[index] = item;
      return { ...prev, holidays: updated };
    });
  };

  // Xóa ngày lễ
  const removeHoliday = (index: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa ngày lễ này không?")) {
      setConfig((prev) => ({
        ...prev,
        holidays: prev.holidays.filter((_, i) => i !== index),
      }));
      toast.success("Đã xóa ngày lễ");
    }
  };

  // Thêm ngày lễ mới
  const handleAddHoliday = () => {
    if (!newHoliday.name?.trim()) {
      toast.error("Vui lòng nhập tên ngày lễ / chiến dịch");
      return;
    }

    const startIso = new Date(newHoliday.startDate || new Date()).toISOString();
    const endIso = new Date(newHoliday.endDate || new Date()).toISOString();

    const compKey = (newHoliday.componentKey || "october20").trim();
    const defaultTpl = getHolidayDefaultTemplate(compKey, newHoliday.name);

    const createdHoliday: HolidayPopupConfig = {
      id: `custom_${Date.now()}`,
      name: newHoliday.name.trim(),
      description: newHoliday.description?.trim() || "",
      enabled: Boolean(newHoliday.enabled),
      startDate: startIso,
      endDate: endIso,
      autoCloseSeconds: Number(newHoliday.autoCloseSeconds) || 30,
      delaySeconds: Number(newHoliday.delaySeconds) || 3,
      componentKey: compKey,
      activeDays: Number(newHoliday.activeDays) || 3,
      priority: Number(newHoliday.priority) || 5,

      // Mặc định tự động điền nội dung mẫu chuẩn
      bannerImage: newHoliday.bannerImage || defaultTpl.bannerImage,
      bannerAlt: newHoliday.bannerAlt || defaultTpl.bannerAlt,
      bannerPosition: defaultTpl.bannerPosition,
      scriptTagline: defaultTpl.scriptTagline,
      mainTitle: defaultTpl.mainTitle,
      dateSubtitle: defaultTpl.dateSubtitle,
      recipientGreeting: defaultTpl.recipientGreeting,
      wishes: defaultTpl.wishes,
      signature: defaultTpl.signature,
      actionText: defaultTpl.actionText,
    };

    setConfig((prev) => ({
      ...prev,
      holidays: [createdHoliday, ...prev.holidays],
    }));

    setShowAddModal(false);
    toast.success("Đã thêm ngày lễ mới với nội dung mẫu mặc định!");
  };

  // Helper hiển thị trạng thái ngày lễ
  const getHolidayStatusBadge = (holiday: HolidayPopupConfig) => {
    if (!holiday.enabled) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
          Đang tắt
        </span>
      );
    }

    const now = new Date().getTime();
    const start = new Date(holiday.startDate).getTime();
    const end = new Date(holiday.endDate).getTime();

    if (now >= start && now <= end) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 animate-pulse">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          Đang diễn ra (Đang hiển thị)
        </span>
      );
    }

    if (now < start) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
          Sắp diễn ra
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
        Đã kết thúc (Về ContactForm)
      </span>
    );
  };

  return (
    <AdminLayout title="Cài đặt Popup & Lịch Ngày Lễ | Đồng Phục UniVi">
      {/* Preview Component Modals Đa Năng */}
      {previewTarget?.type === "contact_form" && (
        <ContactFormPopup
          forceShow={true}
          autoCloseSeconds={config.defaultPopup.autoCloseSeconds}
          pauseOnInteraction={config.defaultPopup.pauseOnInteraction}
          title={config.defaultPopup.title}
          subtitle={config.defaultPopup.subtitle}
          onClose={() => setPreviewTarget(null)}
        />
      )}

      {previewTarget?.type === "holiday" && previewTarget.holidayKey === "october20" && (
        <October20Popup
          holiday={previewTarget.holiday}
          forceShow={true}
          onClose={() => setPreviewTarget(null)}
        />
      )}

      {previewTarget?.type === "holiday" && previewTarget.holidayKey === "tet_holiday" && (
        <TetHolidayPopup
          holiday={previewTarget.holiday}
          forceShow={true}
          onClose={() => setPreviewTarget(null)}
        />
      )}

      {previewTarget?.type === "holiday" && previewTarget.holidayKey === "women_day_83" && (
        <WomenDay83Popup
          holiday={previewTarget.holiday}
          forceShow={true}
          onClose={() => setPreviewTarget(null)}
        />
      )}

      {previewTarget?.type === "holiday" && previewTarget.holidayKey === "holiday_304" && (
        <VictoryDay304Popup
          holiday={previewTarget.holiday}
          forceShow={true}
          onClose={() => setPreviewTarget(null)}
        />
      )}

      {previewTarget?.type === "holiday" && previewTarget.holidayKey === "national_day_29" && (
        <NationalDay29Popup
          holiday={previewTarget.holiday}
          forceShow={true}
          onClose={() => setPreviewTarget(null)}
        />
      )}

      {previewTarget?.type === "holiday" && previewTarget.holidayKey === "teachers_day_2011" && (
        <TeachersDay2011Popup
          holiday={previewTarget.holiday}
          forceShow={true}
          onClose={() => setPreviewTarget(null)}
        />
      )}

      {previewTarget?.type === "holiday" && previewTarget.holidayKey === "xmas_newyear" && (
        <XmasNewYearPopup
          holiday={previewTarget.holiday}
          forceShow={true}
          onClose={() => setPreviewTarget(null)}
        />
      )}

      {previewTarget?.type === "holiday" &&
        !["october20", "tet_holiday", "women_day_83", "holiday_304", "national_day_29", "teachers_day_2011", "xmas_newyear"].includes(
          previewTarget.holidayKey || ""
        ) && (
          <HolidayFestivePopup
            holiday={previewTarget.holiday}
            forceShow={true}
            onClose={() => setPreviewTarget(null)}
          />
        )}

      <div className="p-4 sm:p-6 md:p-8 mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-gray-200 dark:border-gray-800">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-gradient-to-tr from-[#105d97] to-cyan-500 rounded-xl text-white shadow-md">
                <Sparkles size={22} />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  Cài đặt Popup & Lịch Ngày Lễ
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  Popup thông minh theo Lịch Ngày Lễ Việt Nam, tự động quay lại ContactForm sau 20s (dừng khi điền) & chế độ mở test tùy ý
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={fetchSettings}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 transition"
              title="Tải lại dữ liệu"
            >
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
              <span>Tải lại</span>
            </button>

            <button
              type="button"
              onClick={() => setPreviewTarget({ type: "contact_form" })}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-medium text-[#105d97] bg-sky-50 border border-sky-200 rounded-lg hover:bg-sky-100 dark:bg-sky-950 dark:border-sky-800 dark:text-sky-300 transition"
            >
              <Eye size={15} />
              <span>Xem nhanh ContactForm</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-[#105d97] hover:bg-[#0d4c7a] rounded-lg shadow-md hover:shadow-lg transition disabled:opacity-50"
            >
              <Save size={16} />
              <span>{saving ? "Đang lưu..." : "Lưu cài đặt"}</span>
            </button>
          </div>
        </div>

        {/* Realtime Live Status Banner */}
        <div className="rounded-2xl p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-[#0d4c7a] to-[#105d97] text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-semibold uppercase tracking-wider text-sky-200">
                  Trạng thái hiển thị theo thời gian thực (Live Status)
                </span>
                {config.testMode?.enabled && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-900 text-[10px] font-black uppercase tracking-wider">
                    ⚡ Đang bật Ép Test Toàn Site
                  </span>
                )}
              </div>
              <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                {!config.enabled ? (
                  <span className="text-red-300">🔴 Toàn bộ Popup đang bị TẮT</span>
                ) : config.testMode?.enabled && config.testMode.overrideType !== "auto" ? (
                  <span className="text-amber-300">
                    🧪 Chế độ Test Override: Đang ép hiển thị{" "}
                    {config.testMode.overrideType === "contact_form"
                      ? "Contact Form"
                      : (config.holidays.find((h) => h.id === config.testMode?.forcedHolidayId)?.name || "Ngày Lễ")}
                  </span>
                ) : resolved.popupType === "holiday" && resolved.activeHoliday ? (
                  <span className="text-amber-300">
                    🎉 Đang chạy ngày lễ: {resolved.activeHoliday.name}
                  </span>
                ) : (
                  <span className="text-sky-100">
                    🎯 Đang hiển thị Popup mặc định: Contact Form (Tự động đóng sau {config.defaultPopup.autoCloseSeconds}s)
                  </span>
                )}
              </h2>
              <p className="text-xs sm:text-sm text-sky-100/90 max-w-3xl">
                {config.testMode?.enabled && config.testMode.overrideType !== "auto"
                  ? "Hệ thống đang ở chế độ thử nghiệm theo tùy ý của bạn: Bỏ qua kiểm tra lịch ngày tháng và hiển thị trực tiếp popup được chọn để bạn kiểm tra giao diện và nội dung."
                  : resolved.popupType === "holiday" && resolved.activeHoliday
                  ? `Chiến dịch "${resolved.activeHoliday.name}" đang diễn ra từ ${new Date(resolved.activeHoliday.startDate).toLocaleDateString("vi-VN")} đến ${new Date(resolved.activeHoliday.endDate).toLocaleDateString("vi-VN")}. Sau khi hết hạn, hệ thống sẽ tự động chuyển về ContactForm.`
                  : "Không có ngày lễ nào đang chạy hôm nay. Website tự động hiển thị Popup ContactForm với tính năng dừng đếm ngược khi khách hàng gõ hoặc tương tác vào form."}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20 text-center min-w-[130px]">
                <div className="text-[11px] text-sky-200 font-medium">Thời gian tự đóng</div>
                <div className="text-xl font-extrabold text-amber-300">
                  {resolved.autoCloseSeconds}s
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20 text-center min-w-[130px]">
                <div className="text-[11px] text-sky-200 font-medium">Dừng khi tương tác</div>
                <div className="text-xl font-extrabold text-emerald-300">
                  {config.defaultPopup.pauseOnInteraction ? "Đã bật ✓" : "Tắt ✕"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION MỚI: CHẾ ĐỘ THỬ NGHIỆM & MỞ POPUP THEO TÙY Ý (LIVE TEST PLAYGROUND) */}
        {/* ========================================================================= */}
        <div className="bg-gradient-to-br from-white via-sky-50/40 to-blue-50/30 dark:from-gray-800 dark:via-gray-850 dark:to-slate-800 rounded-2xl shadow-sm border-2 border-sky-300/60 dark:border-sky-800/60 overflow-hidden">
          <div className="px-6 py-4 bg-sky-500/10 dark:bg-sky-950/40 border-b border-sky-200 dark:border-sky-800/50 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#105d97] text-white rounded-xl shadow-md">
                <Play size={20} className="fill-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                    Chế Độ Mở Theo Tùy Ý & Kiểm Thử Giao Diện / Nội Dung
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#105d97] text-white tracking-wide uppercase">
                    Live Playground
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Mở popup bất kỳ lúc nào để test nội dung, giao diện, đếm ngược và hiệu ứng tương tác
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Bộ điều khiển chọn popup để test */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
              <div className="lg:col-span-5 space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Chọn Popup Bạn Muốn Mở Test:
                </label>
                <select
                  value={selectedTestPopup}
                  onChange={(e) => setSelectedTestPopup(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm font-semibold bg-white dark:bg-gray-900 border-2 border-sky-300 dark:border-sky-700 rounded-xl focus:ring-2 focus:ring-[#105d97] focus:outline-none text-gray-900 dark:text-white shadow-sm"
                >
                  <option value="contact_form">🎯 [Popup Mặc Định] Form Báo Giá & Tư Vấn (ContactForm)</option>
                  <optgroup label="─── Lịch Ngày Lễ Việt Nam ───">
                    {config.holidays.map((h) => (
                      <option key={h.id} value={h.id}>
                        🎉 {h.name} ({h.componentKey})
                      </option>
                    ))}
                  </optgroup>
                </select>
                <p className="text-[11px] text-gray-500">
                  Chọn bất kỳ popup nào để mở xem thử giao diện, nội dung hoặc mở trực tiếp trên website.
                </p>
              </div>

              {/* Các nút hành động test */}
              <div className="lg:col-span-7 flex flex-wrap items-center gap-3 pt-2 lg:pt-5">
                {/* Nút 1: Mở Test Ngay Trong Dashboard */}
                <button
                  type="button"
                  onClick={() => {
                    if (selectedTestPopup === "contact_form") {
                      setPreviewTarget({ type: "contact_form" });
                    } else {
                      const found = config.holidays.find((h) => h.id === selectedTestPopup);
                      setPreviewTarget({
                        type: "holiday",
                        holidayKey: found?.componentKey || "october20",
                        holiday: found,
                      });
                    }
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#105d97] hover:bg-[#0d4c7a] rounded-xl shadow-md hover:shadow-lg transition transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Eye size={17} />
                  <span>Mở Test Popup Ngay (Xem Thử)</span>
                </button>

                {/* Nút 2: Mở Test Ngoài Trang Chủ */}
                <button
                  type="button"
                  onClick={() => {
                    const testUrl = `/?popup_test=${selectedTestPopup}`;
                    window.open(testUrl, "_blank");
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#105d97] bg-white border-2 border-[#105d97]/40 hover:bg-sky-50 dark:bg-gray-900 dark:text-sky-300 dark:border-sky-700 rounded-xl shadow-sm transition"
                  title="Mở tab mới với URL ép popup này xuất hiện"
                >
                  <ExternalLink size={16} />
                  <span>Test Trên Trang Chủ (Tab Mới)</span>
                </button>
              </div>
            </div>

            {/* Khung Ép Hiển Thị Toàn Website (Force Override Setting) */}
            <div className="p-4 sm:p-5 bg-white dark:bg-gray-900/80 rounded-xl border border-sky-200 dark:border-gray-700 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <SlidersHorizontal size={16} className="text-[#105d97]" />
                    <span>Chế Độ Ép Hiển Thị Toàn Website (Force Override)</span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-gray-500">
                    Bật tùy chọn này để website bên ngoài luôn hiển thị popup bạn chọn, tiện cho việc kiểm tra trên điện thoại hoặc máy tính khác
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(config.testMode?.enabled)}
                    onChange={(e) => updateTestMode("enabled", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                  <span className="ml-3 text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200">
                    {config.testMode?.enabled ? "Đang BẬT Ép Test" : "Đang TẮT"}
                  </span>
                </label>
              </div>

              {config.testMode?.enabled && (
                <div className="pt-3 border-t border-gray-100 dark:border-gray-800 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                      Kiểu Ép Hiển Thị:
                    </label>
                    <select
                      value={config.testMode.overrideType || "contact_form"}
                      onChange={(e) => updateTestMode("overrideType", e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg font-semibold"
                    >
                      <option value="contact_form">Ép hiển thị ContactForm</option>
                      <option value="holiday">Ép hiển thị Ngày Lễ</option>
                    </select>
                  </div>

                  {config.testMode.overrideType === "holiday" && (
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                        Chọn Ngày Lễ Muốn Ép:
                      </label>
                      <select
                        value={config.testMode.forcedHolidayId || config.holidays[0]?.id}
                        onChange={(e) => updateTestMode("forcedHolidayId", e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg font-semibold"
                      >
                        {config.holidays.map((h) => (
                          <option key={h.id} value={h.id}>
                            {h.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="space-y-2 flex flex-col justify-center">
                    <label className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.testMode.forceShowImmediately !== false}
                        onChange={(e) => updateTestMode("forceShowImmediately", e.target.checked)}
                        className="w-4 h-4 text-[#105d97] rounded"
                      />
                      <span>Mở ngay lập tức (Delay = 0 giây)</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 1: Cấu hình Popup Mặc Định (Contact Form) */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-850 border-b border-gray-100 dark:border-gray-700 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-sky-100 dark:bg-sky-950 text-[#105d97] dark:text-sky-300 rounded-lg">
                <Sliders size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  1. Cấu hình Popup Mặc Định (Contact Form)
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Hiển thị khi truy cập website và tự động quay lại sau khi hết ngày lễ
                </p>
              </div>
            </div>

            {/* Toggle bật/tắt toàn bộ */}
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.enabled}
                onChange={(e) => setConfig((prev) => ({ ...prev, enabled: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#105d97]"></div>
              <span className="ml-3 text-sm font-semibold text-gray-900 dark:text-gray-300">
                {config.enabled ? "Bật Popup Website" : "Tắt Popup"}
              </span>
            </label>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Thời gian hiển thị tự đóng (giây) */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Thời gian tự động đóng (Giây) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={5}
                    max={300}
                    value={config.defaultPopup.autoCloseSeconds}
                    onChange={(e) => updateDefaultPopup("autoCloseSeconds", Number(e.target.value) || 20)}
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#105d97] focus:outline-none font-semibold text-gray-900 dark:text-white"
                  />
                  <Clock size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
                  <span className="absolute right-3.5 top-3 text-xs text-gray-400">giây</span>
                </div>
                <p className="text-[11px] text-gray-500">
                  Mặc định là <strong>20 giây</strong> theo yêu cầu. Sau 20s popup sẽ tự mất nếu không có tương tác.
                </p>
              </div>

              {/* Dừng đếm ngược khi tương tác */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Dừng đếm ngược khi điền Form
                </label>
                <div className="flex items-center gap-3 p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl">
                  <input
                    type="checkbox"
                    id="pauseOnInteraction"
                    checked={config.defaultPopup.pauseOnInteraction}
                    onChange={(e) => updateDefaultPopup("pauseOnInteraction", e.target.checked)}
                    className="w-4 h-4 text-[#105d97] rounded focus:ring-[#105d97]"
                  />
                  <label htmlFor="pauseOnInteraction" className="text-xs font-medium text-gray-800 dark:text-gray-200 cursor-pointer">
                    Dừng đếm ngược khi khách bắt đầu điền form
                  </label>
                </div>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                  ✓ Khi khách gõ phím hoặc chạm vào ô nhập liệu, timer dừng ngay để khách yên tâm hoàn thành.
                </p>
              </div>

              {/* Độ trễ xuất hiện */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Độ trễ xuất hiện sau khi vào web
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    max={60}
                    value={config.defaultPopup.delaySeconds}
                    onChange={(e) => updateDefaultPopup("delaySeconds", Number(e.target.value) || 2)}
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#105d97] focus:outline-none font-semibold text-gray-900 dark:text-white"
                  />
                  <Clock size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
                  <span className="absolute right-3.5 top-3 text-xs text-gray-400">giây</span>
                </div>
                <p className="text-[11px] text-gray-500">
                  Thời gian chờ sau khi trang web tải xong trước khi popup mở lên (khuyên dùng 2-3s).
                </p>
              </div>
            </div>

            {/* Tần suất hiển thị */}
            <div className="pt-2 border-t border-gray-100 dark:border-gray-850">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                Tần suất hiển thị Popup
              </label>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                  <input
                    type="radio"
                    name="displayFrequency"
                    value="always"
                    checked={config.defaultPopup.displayFrequency === "always"}
                    onChange={() => updateDefaultPopup("displayFrequency", "always")}
                    className="text-[#105d97] focus:ring-[#105d97]"
                  />
                  <span>Mỗi lần tải trang / chuyển trang mới (Always)</span>
                </label>
                <label className="flex items-center gap-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                  <input
                    type="radio"
                    name="displayFrequency"
                    value="once_per_session"
                    checked={config.defaultPopup.displayFrequency === "once_per_session"}
                    onChange={() => updateDefaultPopup("displayFrequency", "once_per_session")}
                    className="text-[#105d97] focus:ring-[#105d97]"
                  />
                  <span>Chỉ hiển thị 1 lần duy nhất trong mỗi phiên duyệt web (Session)</span>
                </label>
              </div>
            </div>

            {/* Tiêu đề & Phụ đề */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-gray-100 dark:border-gray-850">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Tiêu đề trên thanh Popup ContactForm
                </label>
                <input
                  type="text"
                  value={config.defaultPopup.title}
                  onChange={(e) => updateDefaultPopup("title", e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#105d97] focus:outline-none text-gray-900 dark:text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Phụ đề mô tả quyền lợi
                </label>
                <input
                  type="text"
                  value={config.defaultPopup.subtitle}
                  onChange={(e) => updateDefaultPopup("subtitle", e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#105d97] focus:outline-none text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Lịch Popup Ngày Lễ Đặc Biệt Của Việt Nam */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-850 border-b border-gray-100 dark:border-gray-700 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-300 rounded-lg">
                <Gift size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  2. Lịch Popup Ngày Lễ Đặc Biệt Của Việt Nam
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Tự động hiển thị popup ngày lễ khi đến lịch. Khi hết ngày hiển thị, hệ thống tự động quay lại ContactForm.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-700 hover:to-rose-700 rounded-lg shadow-sm transition"
            >
              <Plus size={16} />
              <span>Thêm ngày lễ mới</span>
            </button>
          </div>

          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 font-semibold uppercase text-[11px] tracking-wider">
                    <th className="py-3 px-3">Kích hoạt</th>
                    <th className="py-3 px-4">Ngày lễ / Chiến dịch</th>
                    <th className="py-3 px-4">Trạng thái</th>
                    <th className="py-3 px-4">Số ngày hiển thị</th>
                    <th className="py-3 px-4">Lịch bắt đầu - kết thúc</th>
                    <th className="py-3 px-4">Thời gian tự đóng</th>
                    <th className="py-3 px-4">Component áp dụng</th>
                    <th className="py-3 px-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {config.holidays.map((holiday, idx) => (
                    <tr
                      key={holiday.id || idx}
                      className={`hover:bg-gray-50/70 dark:hover:bg-gray-750 transition ${isHolidayActive(holiday) ? "bg-amber-50/40 dark:bg-amber-950/20" : ""
                        }`}
                    >
                      {/* Toggle */}
                      <td className="py-3 px-3">
                        <input
                          type="checkbox"
                          checked={holiday.enabled}
                          onChange={() => toggleHoliday(idx)}
                          className="w-4 h-4 text-[#105d97] rounded focus:ring-[#105d97] cursor-pointer"
                        />
                      </td>

                      {/* Tên ngày lễ */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-gray-900 dark:text-white">
                          {holiday.name}
                        </div>
                        {holiday.description && (
                          <div className="text-[11px] text-gray-500 line-clamp-1">
                            {holiday.description}
                          </div>
                        )}
                      </td>

                      {/* Badge trạng thái */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {getHolidayStatusBadge(holiday)}
                      </td>

                      {/* Số ngày hiển thị */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min={1}
                            max={60}
                            value={holiday.activeDays || 3}
                            onChange={(e) => updateHoliday(idx, "activeDays", Number(e.target.value) || 1)}
                            className="w-16 px-2 py-1 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded font-semibold text-center"
                          />
                          <span className="text-xs text-gray-500">ngày</span>
                        </div>
                      </td>

                      {/* Lịch bắt đầu - kết thúc */}
                      <td className="py-3 px-4 whitespace-nowrap text-xs">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                            <span className="text-[10px] text-gray-400 font-mono">Từ:</span>
                            <input
                              type="date"
                              value={holiday.startDate.slice(0, 10)}
                              onChange={(e) => {
                                const newStart = `${e.target.value}T00:00:00+07:00`;
                                updateHoliday(idx, "startDate", newStart);
                              }}
                              className="px-2 py-0.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded text-xs"
                            />
                          </div>
                          <div className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                            <span className="text-[10px] text-gray-400 font-mono">Đến:</span>
                            <input
                              type="date"
                              value={holiday.endDate.slice(0, 10)}
                              onChange={(e) => {
                                const newEnd = `${e.target.value}T23:59:59+07:00`;
                                updateHoliday(idx, "endDate", newEnd);
                              }}
                              className="px-2 py-0.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded text-xs"
                            />
                          </div>
                        </div>
                      </td>

                      {/* Thời gian hiển thị (giây) */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min={5}
                            max={300}
                            value={holiday.autoCloseSeconds || 30}
                            onChange={(e) => updateHoliday(idx, "autoCloseSeconds", Number(e.target.value) || 30)}
                            className="w-16 px-2 py-1 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded text-center font-medium"
                          />
                          <span className="text-xs text-gray-500">giây</span>
                        </div>
                      </td>

                      {/* Component áp dụng */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <select
                            value={holiday.componentKey}
                            onChange={(e) => updateHoliday(idx, "componentKey", e.target.value)}
                            className="px-2 py-1 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded font-mono"
                          >
                            <option value="october20">October20Popup (20/10)</option>
                            <option value="tet_holiday">tet_holiday (Tết)</option>
                            <option value="women_day_83">women_day_83 (8/3)</option>
                            <option value="holiday_304">holiday_304 (30/4)</option>
                            <option value="national_day_29">national_day_29 (2/9)</option>
                            <option value="teachers_day_2011">teachers_day_2011 (20/11)</option>
                            <option value="xmas_newyear">xmas_newyear (Noel)</option>
                            <option value="custom_component">Tùy chỉnh khác...</option>
                          </select>
                        </div>
                      </td>

                      {/* Nút Sửa, Xem thử & Xóa */}
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditHolidayModal(idx)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-[#105d97] bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/60 dark:text-sky-300 dark:hover:bg-sky-900 rounded-lg border border-sky-200 dark:border-sky-800 transition"
                            title="Chỉnh sửa hình ảnh và nội dung popup này"
                          >
                            <Edit3 size={13} />
                            <span>Sửa ảnh & nội dung</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setPreviewTarget({
                                type: "holiday",
                                holidayKey: holiday.componentKey,
                                holiday,
                              });
                            }}
                            className="p-1.5 text-[#105d97] hover:bg-sky-50 dark:hover:bg-sky-950/40 rounded-lg transition"
                            title={`Xem thử popup: ${holiday.name}`}
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeHoliday(idx)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition"
                            title="Xóa ngày lễ này"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Thêm Ngày Lễ Mới */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 border border-gray-200 dark:border-gray-700 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Gift className="text-amber-500" size={18} />
                <span>Thêm Ngày Lễ / Chiến Dịch Mới</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Tên ngày lễ / chiến dịch <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Giỗ tổ Hùng Vương (10/03 Âm Lịch)"
                  value={newHoliday.name || ""}
                  onChange={(e) => setNewHoliday({ ...newHoliday, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#105d97]"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Mô tả ngắn
                </label>
                <input
                  type="text"
                  placeholder="Mô tả nội dung popup..."
                  value={newHoliday.description || ""}
                  onChange={(e) => setNewHoliday({ ...newHoliday, description: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#105d97]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Ngày bắt đầu
                  </label>
                  <input
                    type="date"
                    value={(newHoliday.startDate || "").slice(0, 10)}
                    onChange={(e) => setNewHoliday({ ...newHoliday, startDate: `${e.target.value}T00:00:00+07:00` })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Ngày kết thúc
                  </label>
                  <input
                    type="date"
                    value={(newHoliday.endDate || "").slice(0, 10)}
                    onChange={(e) => setNewHoliday({ ...newHoliday, endDate: `${e.target.value}T23:59:59+07:00` })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Thời gian tự đóng (giây)
                  </label>
                  <input
                    type="number"
                    min={5}
                    value={newHoliday.autoCloseSeconds || 30}
                    onChange={(e) => setNewHoliday({ ...newHoliday, autoCloseSeconds: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Component Key
                  </label>
                  <input
                    type="text"
                    placeholder="october20 hoặc custom..."
                    value={newHoliday.componentKey || "october20"}
                    onChange={(e) => setNewHoliday({ ...newHoliday, componentKey: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg font-mono text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="newHolidayEnabled"
                  checked={newHoliday.enabled !== false}
                  onChange={(e) => setNewHoliday({ ...newHoliday, enabled: e.target.checked })}
                  className="w-4 h-4 text-[#105d97] rounded"
                />
                <label htmlFor="newHolidayEnabled" className="font-medium text-gray-700 dark:text-gray-300">
                  Kích hoạt ngày lễ này ngay khi tạo
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-xs sm:text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleAddHoliday}
                className="px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-[#105d97] hover:bg-[#0d4c7a] rounded-lg shadow"
              >
                Thêm ngày lễ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Input upload file ẩn */}
      <input
        type="file"
        ref={fileInputRef}
        hidden
        accept="image/*"
        onChange={(e) => handleUploadImage(e)}
      />

      {/* ========================================================================= */}
      {/* MODAL CHỈNH SỬA HÌNH ẢNH & NỘI DUNG POPUP CHI TIẾT */}
      {/* ========================================================================= */}
      {editingHoliday && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-white dark:bg-gray-850 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col max-h-[92vh] overflow-hidden">
            {/* Header Modal */}
            <div className="px-6 py-3.5 bg-gradient-to-r from-sky-50 to-white dark:from-gray-800 dark:to-gray-850 border-b border-gray-100 dark:border-gray-700 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#105d97] text-white rounded-lg shadow-sm">
                  <Edit3 size={18} />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span>{editingHoliday.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-sky-100 text-[#105d97] dark:bg-sky-950 dark:text-sky-300">
                      Màu chủ đạo #105d97
                    </span>
                  </h3>
                  <p className="text-xs text-gray-500">
                    Cấu hình ảnh banner và nội dung thiệp popup
                  </p>
                </div>
              </div>

              {/* Nút chuyển đổi chế độ Chỉnh sửa / Xem trước (Tab Switcher) */}
              <div className="inline-flex items-center p-1 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-inner">
                <button
                  type="button"
                  onClick={() => setEditModalTab("edit")}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    editModalTab === "edit"
                      ? "bg-[#105d97] text-white shadow-sm"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <Edit3 size={14} />
                  <span>1. Chỉnh Sửa</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditModalTab("preview")}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    editModalTab === "preview"
                      ? "bg-[#105d97] text-white shadow-sm"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <Eye size={14} />
                  <span>2. Xem Trước Popup</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetToDefaultTemplate}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:text-amber-300 rounded-lg border border-amber-200 dark:border-amber-800 transition"
                  title="Khôi phục toàn bộ hình ảnh và nội dung mẫu chuẩn của ngày lễ này"
                >
                  <RotateCcw size={13} />
                  <span className="hidden sm:inline">Khôi phục mẫu</span>
                </button>

                <button
                  type="button"
                  onClick={() => setEditingHoliday(null)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Body Modal: Chế độ 1: Chỉnh sửa (edit) HOẶC Chế độ 2: Xem trước Popup (preview) */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm">
              {editModalTab === "edit" ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* CỘT 1: HÌNH ẢNH BANNER POPUP (5 cols) */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="flex items-center gap-2 pb-1 border-b border-gray-100 dark:border-gray-700">
                    <ImageIcon size={16} className="text-[#105d97]" />
                    <span className="font-bold uppercase tracking-wider text-gray-800 dark:text-gray-200">
                      1. Hình Ảnh Banner Popup
                    </span>
                  </div>

                  {/* Khung Kéo Thả Căn Chỉnh Vị Trí Ảnh Banner */}
                  <div className="space-y-2">
                    {editingHoliday.bannerImage ? (
                      <BannerPositionInteractiveEditor
                        imageSrc={editingHoliday.bannerImage}
                        position={editingHoliday.bannerPosition}
                        onChange={(pos) => updateEditingHolidayField("bannerPosition", pos)}
                      />
                    ) : (
                      <div className="space-y-2">
                        <label className="block font-semibold text-gray-700 dark:text-gray-300">
                          Xem trước ảnh banner:
                        </label>
                        <div className="relative w-full h-36 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center">
                          <div className="text-center p-4 text-gray-400">
                            <ImageIcon size={32} className="mx-auto mb-1 text-gray-300" />
                            <span className="text-xs font-medium">Đang sử dụng ảnh mặc định của chiến dịch</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Nút Upload và Input URL */}
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        disabled={uploadingImage}
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center justify-center gap-2 px-3 py-2.5 font-semibold text-xs text-white bg-[#105d97] hover:bg-[#0d4c7a] rounded-xl shadow-sm transition disabled:opacity-50"
                      >
                        <Upload size={15} className={uploadingImage ? "animate-spin" : ""} />
                        <span>{uploadingImage ? "Đang tải ảnh..." : "Tải ảnh từ máy tính"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setR2TargetForNew(false);
                          setR2InitialTab("manage");
                          setShowR2Modal(true);
                        }}
                        className="inline-flex items-center justify-center gap-2 px-3 py-2.5 font-semibold text-xs text-[#105d97] bg-sky-50 hover:bg-sky-100 dark:bg-gray-800 dark:text-sky-300 border border-sky-200 dark:border-gray-700 rounded-xl transition"
                      >
                        <Folder size={15} />
                        <span>Kho ảnh R2 (thumbnail)</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-gray-500 bg-sky-50/60 dark:bg-sky-950/30 px-2.5 py-1.5 rounded-lg border border-sky-100 dark:border-sky-900/50">
                      <span className="flex items-center gap-1.5 text-sky-800 dark:text-sky-300 font-medium">
                        <Folder size={13} className="text-[#105d97]" />
                        Thư mục R2: <code className="font-bold bg-white dark:bg-gray-800 px-1 py-0.5 rounded text-[#105d97]">thumbnail</code>
                      </span>
                      <span className="text-gray-400">Tải lên sẽ tự động lưu vào đây</span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1">
                        Hoặc dán đường dẫn (URL) ảnh banner:
                      </label>
                      <input
                        type="text"
                        placeholder="https://... hoặc /images/banner-home.jpg"
                        value={editingHoliday.bannerImage || ""}
                        onChange={(e) => updateEditingHolidayField("bannerImage", e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs"
                      />
                    </div>

                    {/* Ảnh gợi ý có sẵn */}
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-500 mb-1.5">
                        Hoặc chọn nhanh ảnh mẫu có sẵn:
                      </label>
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <button
                          type="button"
                          onClick={() => updateEditingHolidayField("bannerImage", "/images/campaigns/anh-pik-20-10.jpg")}
                          className="px-2 py-1.5 bg-gray-100 hover:bg-sky-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded border border-gray-200 dark:border-gray-700 text-left truncate"
                        >
                          🌸 Banner Hoa Phụ Nữ
                        </button>
                        <button
                          type="button"
                          onClick={() => updateEditingHolidayField("bannerImage", "/images/banner-home.jpg")}
                          className="px-2 py-1.5 bg-gray-100 hover:bg-sky-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded border border-gray-200 dark:border-gray-700 text-left truncate"
                        >
                          🏅 Banner Thể Thao Home
                        </button>
                        <button
                          type="button"
                          onClick={() => updateEditingHolidayField("bannerImage", "/images/banner-bts.webp")}
                          className="px-2 py-1.5 bg-gray-100 hover:bg-sky-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded border border-gray-200 dark:border-gray-700 text-left truncate"
                        >
                          ✨ Bộ Sưu Tập BTS
                        </button>
                        <button
                          type="button"
                          onClick={() => updateEditingHolidayField("bannerImage", "/images/team-univi.jpg")}
                          className="px-2 py-1.5 bg-gray-100 hover:bg-sky-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded border border-gray-200 dark:border-gray-700 text-left truncate"
                        >
                          👥 Team Đồng Phục UniVi
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CỘT 2: NỘI DUNG VĂN BẢN (7 cols) */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="flex items-center gap-2 pb-1 border-b border-gray-100 dark:border-gray-700">
                    <FileText size={16} className="text-[#105d97]" />
                    <span className="font-bold uppercase tracking-wider text-gray-800 dark:text-gray-200">
                      2. Nội Dung Văn Bản Thiệp Popup
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Dòng chữ viết tay phụ đề (Tagline)
                      </label>
                      <input
                        type="text"
                        placeholder="Ví dụ: Chúc mừng, Thân gửi, Khai xuân..."
                        value={editingHoliday.scriptTagline || ""}
                        onChange={(e) => updateEditingHolidayField("scriptTagline", e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Dòng phụ ngày tháng
                      </label>
                      <input
                        type="text"
                        placeholder="Ví dụ: 20 THÁNG 10, XUÂN BÍNH NGỌ..."
                        value={editingHoliday.dateSubtitle || ""}
                        onChange={(e) => updateEditingHolidayField("dateSubtitle", e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-serif"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Tiêu đề chính (Chữ in hoa màu #105d97)
                    </label>
                    <input
                      type="text"
                      placeholder="Ví dụ: CHÚC MỪNG NĂM MỚI, NGÀY PHỤ NỮ VIỆT NAM..."
                      value={editingHoliday.mainTitle || ""}
                      onChange={(e) => updateEditingHolidayField("mainTitle", e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-bold text-[#105d97]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Lời chào gửi / Lời tri ân trang trọng
                    </label>
                    <input
                      type="text"
                      placeholder="Ví dụ: Gửi những người phụ nữ tuyệt vời đang đồng hành cùng UniVi..."
                      value={editingHoliday.recipientGreeting || ""}
                      onChange={(e) => updateEditingHolidayField("recipientGreeting", e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-medium"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Nội dung lời chúc / tri ân
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const merged = wishesText.replace(/\s*\n+\s*/g, " ").trim();
                          setWishesText(merged);
                          updateEditingHolidayField("wishes", [merged]);
                          toast.success("Đã dịch các câu lên cùng 1 dòng liền mạch!");
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#105d97] hover:text-blue-800 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 px-2.5 py-1 rounded-md border border-blue-200 dark:border-blue-800 transition"
                      >
                        <span>↳ Dịch tất cả câu lên cùng 1 dòng</span>
                      </button>
                    </div>

                    <textarea
                      rows={6}
                      placeholder="Nhập nội dung lời chúc chi tiết... Có thể viết nhiều câu liên tiếp trong một đoạn văn. Xóa dấu xuống dòng để đưa các câu lên cùng dòng."
                      value={wishesText}
                      onChange={(e) => {
                        const val = e.target.value;
                        setWishesText(val);
                        const paragraphs = parseWishesIntoParagraphs(val);
                        updateEditingHolidayField("wishes", paragraphs);
                      }}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs leading-relaxed font-sans focus:ring-2 focus:ring-[#105d97] focus:border-[#105d97]"
                    />

                    <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                      💡 <em>Bạn có thể viết liền hoặc xóa dấu xuống dòng (Backspace) để đưa các câu lên cùng 1 dòng. Hoặc bấm nút <strong>"↳ Dịch tất cả câu lên cùng 1 dòng"</strong> ở trên.</em>
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Chữ ký thương hiệu
                      </label>
                      <input
                        type="text"
                        placeholder="Trân trọng, UniVi Sport"
                        value={editingHoliday.signature || ""}
                        onChange={(e) => updateEditingHolidayField("signature", e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Chữ trên nút bấm chính
                      </label>
                      <input
                        type="text"
                        placeholder="Ví dụ: Gửi ngàn lời chúc yêu thương 🌸"
                        value={editingHoliday.actionText || ""}
                        onChange={(e) => updateEditingHolidayField("actionText", e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-semibold"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
                /* CHẾ ĐỘ XEM TRƯỚC POPUP SAU KHI SỬA (LIVE PREVIEW) */
                <div className="space-y-4">
                  {/* Toolbar Preview */}
                  <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Khung xem thiết bị:</span>
                      <div className="inline-flex rounded-lg p-0.5 bg-gray-200 dark:bg-gray-700">
                        <button
                          type="button"
                          onClick={() => setPreviewDevice("desktop")}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md transition ${
                            previewDevice === "desktop"
                              ? "bg-white dark:bg-gray-800 text-[#105d97] shadow-sm"
                              : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
                          }`}
                        >
                          <Monitor size={14} />
                          <span>Máy tính (Desktop)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreviewDevice("mobile")}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md transition ${
                            previewDevice === "mobile"
                              ? "bg-white dark:bg-gray-800 text-[#105d97] shadow-sm"
                              : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
                          }`}
                        >
                          <Smartphone size={14} />
                          <span>Điện thoại (Mobile)</span>
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleTriggerTestConfetti}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:text-amber-300 rounded-lg border border-amber-200 dark:border-amber-800 transition shadow-sm"
                      >
                        <Sparkles size={14} />
                        <span>Bắn thử pháo hoa 🎉</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setEditModalTab("edit")}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#105d97] bg-sky-50 hover:bg-sky-100 dark:bg-sky-950 dark:text-sky-300 rounded-lg border border-sky-200 dark:border-sky-800 transition"
                      >
                        <Edit3 size={14} />
                        <span>Quay lại sửa tiếp</span>
                      </button>
                    </div>
                  </div>

                  {/* Vùng Giả Lập Popup Ngoài Thực Tế (Backdrop + Thiệp Popup 1:1) */}
                  <div className="relative rounded-2xl bg-gradient-to-b from-stone-900 via-stone-850 to-stone-950 p-3 sm:p-8 flex items-center justify-center min-h-[500px] overflow-hidden shadow-inner border border-stone-800">
                    {/* Hạt bụi ánh sáng mờ nền */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(16,93,151,0.22),transparent_70%)] pointer-events-none" />

                    {/* Khung Thiệp Popup Mockup */}
                    <div
                      className={`relative rounded-3xl overflow-hidden bg-white shadow-2xl border border-stone-200 text-stone-800 transition-all duration-300 flex flex-col ${
                        previewDevice === "desktop" ? "w-full max-w-4xl" : "w-[360px] sm:w-[380px]"
                      }`}
                    >
                      {/* Nút đóng giả lập */}
                      <button
                        type="button"
                        onClick={() => toast("Đây là nút đóng Popup ngoài trang chủ", { icon: "ℹ️" })}
                        className="absolute top-3 right-3 z-30 p-2 rounded-full bg-white/80 hover:bg-white text-stone-600 hover:text-stone-900 shadow-md backdrop-blur-sm transition"
                        title="Nút đóng popup"
                      >
                        <X size={18} />
                      </button>

                      {/* PHẦN ẢNH BANNER POPUP */}
                      <div
                        className={`relative w-full overflow-hidden bg-stone-100 ${
                          previewDevice === "desktop" ? "h-40 sm:h-48 md:h-52" : "h-36"
                        }`}
                      >
                        <Image
                          src={editingHoliday.bannerImage || "/images/campaigns/anh-pik-20-10.jpg"}
                          alt={editingHoliday.bannerAlt || "Banner Popup"}
                          fill
                          className="object-cover"
                          style={{
                            objectPosition: parsePositionCoords(editingHoliday.bannerPosition)
                              ? `${parsePositionCoords(editingHoliday.bannerPosition).x}% ${parsePositionCoords(editingHoliday.bannerPosition).y}%`
                              : "center 30%",
                          }}
                        />
                        {/* Lớp chuyển tiếp sắc thái mềm mại vào thân thiệp */}
                        <div className="absolute bottom-0 inset-x-0 h-10 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                      </div>

                      {/* PHẦN NỘI DUNG VĂN BẢN POPUP */}
                      <div className="px-5 sm:px-8 pb-6 pt-2 text-center max-w-4xl mx-auto space-y-2.5">
                        {/* 1. Dòng chữ viết tay phụ đề */}
                        {editingHoliday.scriptTagline && (
                          <p
                            className={`${popupStyles.dancingScript} text-xl sm:text-2xl font-bold text-[#105d97] tracking-wide`}
                          >
                            {editingHoliday.scriptTagline}
                          </p>
                        )}

                        {/* 2. Tiêu đề chính in hoa */}
                        {editingHoliday.mainTitle && (
                          <h2
                            className={`${popupStyles.playfairDisplay} text-xl sm:text-2xl md:text-3xl font-extrabold uppercase tracking-wide text-stone-900 leading-tight`}
                          >
                            {editingHoliday.mainTitle}
                          </h2>
                        )}

                        {/* 3. Dòng ngày tháng phụ */}
                        {editingHoliday.dateSubtitle && (
                          <p className="text-xs sm:text-sm font-semibold text-[#105d97] uppercase tracking-wider">
                            {editingHoliday.dateSubtitle}
                          </p>
                        )}

                        {/* Vạch ngăn trang trí */}
                        <div className="w-16 h-0.5 mx-auto bg-gradient-to-r from-transparent via-[#105d97]/40 to-transparent my-2" />

                        {/* 4. Lời tri ân trang trọng */}
                        {editingHoliday.recipientGreeting && (
                          <p className="text-xs sm:text-sm md:text-base font-semibold text-stone-800 leading-relaxed max-w-2xl mx-auto">
                            {editingHoliday.recipientGreeting}
                          </p>
                        )}

                        {/* 5. Các đoạn văn lời chúc liền mạch */}
                        <div className="space-y-2 text-xs sm:text-sm leading-relaxed text-stone-600 max-w-3xl mx-auto text-center pt-1">
                          {parseWishesIntoParagraphs(wishesText).map((para, idx) => (
                            <p key={idx} className="leading-relaxed">
                              {para}
                            </p>
                          ))}
                        </div>

                        {/* 6. Chữ ký thương hiệu */}
                        {editingHoliday.signature && (
                          <div className="pt-2 text-xs sm:text-sm font-bold text-[#105d97] italic tracking-wide">
                            {editingHoliday.signature}
                          </div>
                        )}

                        {/* 7. Nút bấm hành động */}
                        <div className="pt-2 flex justify-center">
                          <button
                            type="button"
                            onClick={handleTriggerTestConfetti}
                            className="inline-flex items-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-white bg-[#105d97] hover:bg-[#0d4c7a] rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0"
                          >
                            <Heart size={16} className="text-rose-300 fill-rose-300" />
                            <span>{editingHoliday.actionText || "Gửi ngàn lời chúc yêu thương 🌸"}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Modal */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {editModalTab === "edit" ? (
                  <button
                    type="button"
                    onClick={() => setEditModalTab("preview")}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-[#105d97] hover:bg-[#0d4c7a] rounded-xl shadow-sm transition"
                  >
                    <Eye size={16} />
                    <span>Xem trước Popup sau khi sửa</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setEditModalTab("edit")}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold text-[#105d97] bg-sky-50 hover:bg-sky-100 dark:bg-sky-950 dark:border-sky-800 border border-sky-200 rounded-xl transition"
                  >
                    <Edit3 size={16} />
                    <span>Quay lại chỉnh sửa</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    const finalParagraphs = parseWishesIntoParagraphs(wishesText);
                    setPreviewTarget({
                      type: "holiday",
                      holidayKey: editingHoliday.componentKey,
                      holiday: {
                        ...editingHoliday,
                        wishes: finalParagraphs.length > 0 ? finalParagraphs : editingHoliday.wishes,
                      },
                    });
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl transition"
                  title="Mở toàn màn hình mô phỏng thật ngoài website"
                >
                  <ExternalLink size={15} />
                  <span className="hidden sm:inline">Mở toàn màn hình</span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setEditingHoliday(null)}
                  className="px-4 py-2 text-xs sm:text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleSaveHolidayContent}
                  className="inline-flex items-center gap-2 px-5 py-2 text-xs sm:text-sm font-bold text-white bg-[#105d97] hover:bg-[#0d4c7a] rounded-xl shadow-md transition"
                >
                  <Save size={16} />
                  <span>Cập nhật & Áp dụng</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal quản lý & chọn ảnh Cloudflare R2 (thư mục thumbnail) */}
      <R2ImageModal
        visible={showR2Modal}
        initialFolder="thumbnail"
        initialTab={r2InitialTab}
        initialFile={r2InitialFile}
        onClose={() => setShowR2Modal(false)}
        onSelect={(res: R2ImageSelectionResult) => {
          const selectedUrl = res.src;
          if (r2TargetForNew) {
            setNewHoliday((prev) => ({ ...prev, bannerImage: selectedUrl }));
          } else if (editingHoliday) {
            setEditingHoliday((prev) => (prev ? { ...prev, bannerImage: selectedUrl } : null));
          }
          setShowR2Modal(false);
          toast.success("Đã chọn ảnh từ thư mục thumbnail R2!");
        }}
      />
    </AdminLayout>
  );
}
