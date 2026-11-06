import React from 'react';
import { Skeleton } from './skeleton';
import { cn } from './utils';

export interface ProductDetailSkeletonProps {
  className?: string;
  isModal?: boolean;
}

/**
 * Skeleton trang hoặc modal chi tiết sản phẩm
 * Khớp cấu trúc 2 cột của ProductDetailView và ProductQuickViewModal:
 * - Cột trái: Gallery ảnh tỷ lệ 3/4 + dải thumbnails
 * - Cột phải: Tiêu đề, giá, mã SKU, bảng màu, chọn size, danh sách USP và nút CTA
 */
export function ProductDetailSkeleton({
  className,
  isModal = false,
}: ProductDetailSkeletonProps) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Đang tải thông tin sản phẩm"
      className={cn('w-full flex flex-col md:flex-row gap-6 md:gap-8 select-none', className)}
    >
      {/* CỘT TRÁI: Gallery hình ảnh */}
      <div className="w-full md:w-1/2 flex flex-col">
        {/* Ảnh chính tỷ lệ 3/4 */}
        <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden border border-gray-100">
          <Skeleton className="w-full h-full rounded-xl" />
        </div>

        {/* Dải 4 thumbnail phía dưới */}
        <div className="grid grid-cols-4 gap-2 md:gap-3 mt-3">
          <Skeleton className="aspect-square rounded-lg" />
          <Skeleton className="aspect-square rounded-lg" />
          <Skeleton className="aspect-square rounded-lg" />
          <Skeleton className="aspect-square rounded-lg" />
        </div>
      </div>

      {/* CỘT PHẢI: Thông tin chi tiết & CTA */}
      <div className="w-full md:w-1/2 flex flex-col justify-between space-y-4">
        <div>
          {/* Badge danh mục */}
          <Skeleton className="h-5 w-28 rounded-full mb-3" />

          {/* Tên sản phẩm */}
          <Skeleton className="h-7 md:h-8 w-11/12 rounded mb-2" />
          <Skeleton className="h-7 md:h-8 w-3/4 rounded mb-4" />

          {/* Hàng sao đánh giá & mã sản phẩm */}
          <div className="flex items-center gap-3 mb-4">
            <Skeleton className="h-4 w-28 rounded" />
            <Skeleton className="h-4 w-24 rounded" />
          </div>

          {/* Khối giá */}
          <div className="bg-gray-50/80 rounded-xl p-3.5 mb-5 flex items-baseline gap-3">
            <Skeleton className="h-7 w-32 rounded" />
            <Skeleton className="h-4 w-20 rounded" />
          </div>

          {/* Bảng màu sắc */}
          <div className="mb-5">
            <Skeleton className="h-4 w-24 rounded mb-2.5" />
            <div className="flex items-center gap-2">
              <Skeleton className="w-7 h-7 rounded-full" />
              <Skeleton className="w-7 h-7 rounded-full" />
              <Skeleton className="w-7 h-7 rounded-full" />
              <Skeleton className="w-7 h-7 rounded-full" />
              <Skeleton className="w-7 h-7 rounded-full" />
            </div>
          </div>

          {/* Bảng kích thước Size */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2.5">
              <Skeleton className="h-4 w-24 rounded" />
              <Skeleton className="h-3.5 w-20 rounded" />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Skeleton className="h-9 w-12 rounded-lg" />
              <Skeleton className="h-9 w-12 rounded-lg" />
              <Skeleton className="h-9 w-12 rounded-lg" />
              <Skeleton className="h-9 w-12 rounded-lg" />
              <Skeleton className="h-9 w-12 rounded-lg" />
            </div>
          </div>

          {/* Khối cam kết dịch vụ B2B (USP) */}
          <div className="space-y-2 py-3 border-t border-b border-gray-100 mb-5">
            <Skeleton className="h-4 w-4/5 rounded" />
            <Skeleton className="h-4 w-3/4 rounded" />
            <Skeleton className="h-4 w-2/3 rounded" />
          </div>
        </div>

        {/* Nút hành động CTA */}
        <div className="space-y-2.5 pt-2">
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
      </div>
      <span className="sr-only">Đang tải thông tin sản phẩm</span>
    </div>
  );
}

export default ProductDetailSkeleton;
