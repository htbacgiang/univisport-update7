import React from 'react';
import { Skeleton } from './skeleton';
import { cn } from './utils';

export interface ArticleCardSkeletonProps {
  className?: string;
}

/**
 * Thẻ bài viết Skeleton
 * Khớp 100% kích thước ảnh (h-56 md:h-64), khoảng cách và bố cục của PostCard.tsx
 */
export function ArticleCardSkeleton({ className }: ArticleCardSkeletonProps) {
  return (
    <article
      className={cn(
        'bg-white rounded-xl shadow-sm overflow-hidden flex flex-col h-full border border-gray-100 select-none',
        className
      )}
      aria-hidden="true"
    >
      {/* Thumbnail */}
      <div className="relative h-56 md:h-64 w-full overflow-hidden">
        <Skeleton className="w-full h-full rounded-none" />
      </div>

      {/* Nội dung bài viết */}
      <div className="py-4 px-6 flex flex-col flex-grow">
        {/* Ngày đăng */}
        <Skeleton className="h-3.5 w-24 mb-3 rounded" />

        {/* Tiêu đề bài viết 2 dòng */}
        <div className="space-y-1.5 mb-4 flex-grow">
          <Skeleton className="h-5 w-full rounded" />
          <Skeleton className="h-5 w-4/5 rounded" />
        </div>

        {/* Nút "Đọc thêm" */}
        <Skeleton className="h-4 w-20 rounded" />
      </div>
    </article>
  );
}

export interface ArticleListSkeletonProps {
  count?: number;
  className?: string;
  ariaLabel?: string;
}

/**
 * Danh sách lưới bài viết Skeleton
 * Khớp cấu trúc lưới 3 cột trên desktop, 1 cột trên mobile của pages/bai-viet/index.tsx
 */
export function ArticleListSkeleton({
  count = 6,
  className,
  ariaLabel = 'Đang tải danh sách bài viết',
}: ArticleListSkeletonProps) {
  const items = Array.from({ length: count }, (_, i) => i);

  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={ariaLabel}
      className={cn('w-full', className)}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((key) => (
          <div key={key}>
            <ArticleCardSkeleton />
          </div>
        ))}
      </div>
      <span className="sr-only">{ariaLabel}</span>
    </div>
  );
}

export default ArticleCardSkeleton;
