import React from 'react';
import { Skeleton } from './skeleton';
import { cn } from './utils';

export interface BannerSkeletonProps {
  className?: string;
}

/**
 * Placeholder giữ chỗ cho BannerCarousel
 * Giữ nguyên chiều cao min-h-[450px] trên desktop, ngăn layout shift (CLS) khi tải ảnh banner từ API.
 */
export function BannerSkeleton({ className }: BannerSkeletonProps) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Đang tải banner quảng cáo"
      className={cn('mt-4 hidden md:block w-full', className)}
    >
      <div className="relative w-full min-h-[450px] overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
        <Skeleton className="w-full h-full min-h-[450px] rounded-lg" />
      </div>
      <span className="sr-only">Đang tải banner quảng cáo</span>
    </div>
  );
}

export default BannerSkeleton;
