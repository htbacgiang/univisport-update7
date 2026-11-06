import React, { FC, useState } from "react";
import { NodeViewWrapper, NodeViewProps } from "@tiptap/react";
import { Edit3, RotateCcw, Trash2, ListChecks } from "lucide-react";
import UniviOrderProcess from "../univisport/order-process/UniviOrderProcess";
import UniviOrderProcessModal from "./UniviOrderProcessModal";
import {
  OrderProcessData,
  DEFAULT_ORDER_PROCESS_DATA,
  normalizeOrderProcessData,
} from "../univisport/order-process/orderProcessData";

export const UniviOrderProcessNodeView: FC<NodeViewProps> = ({
  node,
  updateAttributes,
  deleteNode,
}) => {
  const [modalOpen, setModalOpen] = useState(false);

  const currentData: OrderProcessData = normalizeOrderProcessData({
    badge: node.attrs.badge,
    title: node.attrs.title,
    steps: node.attrs.steps,
    footerTitle: node.attrs.footerTitle,
    footerText: node.attrs.footerText,
    ctaText: node.attrs.ctaText,
    ctaSubtext: node.attrs.ctaSubtext,
  });

  const handleSaveModal = (updatedData: OrderProcessData) => {
    updateAttributes({
      badge: updatedData.badge,
      title: updatedData.title,
      steps: updatedData.steps,
      footerTitle: updatedData.footerTitle,
      footerText: updatedData.footerText,
      ctaText: updatedData.ctaText,
      ctaSubtext: updatedData.ctaSubtext,
    });
  };

  const handleReset = () => {
    if (
      window.confirm(
        "Bạn có chắc muốn khôi phục toàn bộ nội dung Quy trình đặt hàng Univi về mặc định?"
      )
    ) {
      updateAttributes({
        badge: DEFAULT_ORDER_PROCESS_DATA.badge,
        title: DEFAULT_ORDER_PROCESS_DATA.title,
        steps: DEFAULT_ORDER_PROCESS_DATA.steps,
        footerTitle: DEFAULT_ORDER_PROCESS_DATA.footerTitle,
        footerText: DEFAULT_ORDER_PROCESS_DATA.footerText,
        ctaText: DEFAULT_ORDER_PROCESS_DATA.ctaText,
        ctaSubtext: DEFAULT_ORDER_PROCESS_DATA.ctaSubtext,
      });
    }
  };

  return (
    <NodeViewWrapper className="univi-order-process-node-view relative my-8 group select-none">
      {/* Thanh công cụ quản trị trên đầu khối component trong Editor */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-[#105d97] text-white px-4 py-2  text-xs font-semibold shadow-sm">
        <div className="flex items-center gap-2">
          <ListChecks className="w-4 h-4 text-sky-200" />
          <span className="tracking-wide">Thành phần Univi:</span>
          <span className="bg-white/20 px-2.5 py-0.5 rounded-full font-mono text-[11px]">
            Quy trình đặt hàng (4 bước)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-1 bg-white text-[#105d97] hover:bg-sky-50 px-2.5 py-1 rounded-md transition-colors text-[11px] font-bold cursor-pointer shadow-xs"
            title="Chỉnh sửa tiêu đề, các bước, ẩn/hiện hoặc thay đổi thứ tự"
          >
            <Edit3 className="w-3 h-3" />
            <span>Sửa nội dung</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1 bg-white/15 hover:bg-white/25 text-white px-2 py-1 rounded-md transition-colors text-[11px] font-medium cursor-pointer"
            title="Khôi phục nội dung 4 bước mặc định"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Khôi phục</span>
          </button>

          <button
            type="button"
            onClick={deleteNode}
            className="inline-flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded-md transition-colors text-[11px] font-bold cursor-pointer"
            title="Xóa component này khỏi bài viết"
          >
            <Trash2 className="w-3 h-3" />
            <span>Xóa</span>
          </button>
        </div>
      </div>

      {/* Live Preview của Component trong Editor */}
      <div className="p-3 sm:p-6 bg-white">
        <UniviOrderProcess data={currentData} isEditorPreview={true} />
      </div>

      {/* Modal chỉnh sửa chi tiết */}
      <UniviOrderProcessModal
        visible={modalOpen}
        initialData={currentData}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveModal}
      />
    </NodeViewWrapper>
  );
};

export default UniviOrderProcessNodeView;

