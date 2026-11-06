import React from 'react';
import { Skeleton } from './skeleton';
import { cn } from './utils';

export interface ProductCardSkeletonProps {
  className?: string;
  layout?: 'grid' | 'slider';
}

/**
 * Thẻ sản phẩm Skeleton
 * Khớp 100% tỷ lệ khung hình (aspect-[3/4]), bo góc và vị trí nhãn, giá, tên, swatch màu của ProductCard thật.
 */
export function ProductCardSkeleton({ className, layout = 'grid' }: ProductCardSkeletonProps) {
  return (
    <div
      className={cn('flex flex-col gap-3 md:gap-4 w-full select-none', className)}
      aria-hidden="true"
    >
      {/* Khối ảnh tỷ lệ 3/4 */}
      <div className="relative w-full aspect-[3/4] overflow-hidden rounded-xl md:rounded-2xl">
        <Skeleton className="w-full h-full rounded-xl md:rounded-2xl" />
      </div>

      {/* Khối thông tin sản phẩm */}
      <div className="flex flex-col">
        {/* Nhãn "Giá tham khảo" */}
        <Skeleton className="h-3 w-20 mb-2 rounded" />

        {/* Mức giá */}
        <div className="flex items-center gap-2 mb-2">
          <Skeleton className="h-5 w-24 rounded" />
          <Skeleton className="h-3.5 w-16 rounded" />
        </div>

        {/* Tên sản phẩm 2 dòng */}
        <div className="space-y-1.5 mb-2.5">
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-3/4 rounded" />
        </div>

        {/* Hàng swatch màu sắc */}
        <div className="flex items-center gap-1.5 md:gap-2">
          <Skeleton className="w-[22px] h-[22px] md:w-[26px] md:h-[26px] rounded-full" />
          <Skeleton className="w-[22px] h-[22px] md:w-[26px] md:h-[26px] rounded-full" />
          <Skeleton className="w-[22px] h-[22px] md:w-[26px] md:h-[26px] rounded-full" />
          <Skeleton className="w-[22px] h-[22px] md:w-[26px] md:h-[26px] rounded-full" />
        </div>
      </div>
    </div>
  );
}

export interface ProductGridSkeletonProps {
  count?: number;
  className?: string;
  ariaLabel?: string;
}

/**
 * Lưới danh sách sản phẩm Skeleton
 * Giữ nguyên số cột responsive 2 cột mobile, 4 cột desktop tương thích ProductGridSection
 */
export function ProductGridSkeleton({
  count = 8,
  className,
  ariaLabel = 'Đang tải danh sách sản phẩm',
}: ProductGridSkeletonProps) {
  const items = Array.from({ length: count }, (_, i) => i);

  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={ariaLabel}
      className={cn('w-full', className)}
    >
      <div className="grid gap-6 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((key) => (
          <div key={key}>
            <ProductCardSkeleton />
          </div>
        ))}
      </div>
      <span className="sr-only">{ariaLabel}</span>
    </div>
  );
}

export default ProductCardSkeleton;
