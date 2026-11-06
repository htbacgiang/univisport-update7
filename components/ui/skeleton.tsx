import React from 'react';
import { cn } from './utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  shimmer?: boolean;
}

/**
 * Component Skeleton nguyên tử chuẩn của Univi
 * - Sử dụng màu nền xám trung tính, êm dịu, không gây chói mắt hay nhấp nháy gắt
 * - Tự động tắt animation khi người dùng bật `prefers-reduced-motion`
 * - Ẩn khỏi screen reader mặc định (aria-hidden="true") để tránh đọc placeholder
 */
export function Skeleton({ className, shimmer = true, ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'relative overflow-hidden rounded-md bg-gray-200/80 dark:bg-gray-800',
        shimmer &&
          'before:absolute before:inset-0 before:-translate-x-full before:animate-[univi-shimmer_1.8s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/40 before:to-transparent motion-reduce:before:animate-none',
        className
      )}
      {...props}
    />
  );
}

export default Skeleton;
