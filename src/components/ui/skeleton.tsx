import * as React from 'react';
import { cn } from '@/lib/utils';

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-testid="skeleton"
      className={cn('animate-pulse rounded-md bg-neutral-200/70', className)}
      {...props}
    />
  );
}

function SkeletonText({
  className,
  lines = 1,
  lastLineWidth = '100%',
}: {
  className?: string;
  lines?: number;
  lastLineWidth?: string;
}) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-3"
          style={i === lines - 1 ? { width: lastLineWidth } : undefined}
        />
      ))}
    </div>
  );
}

function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      data-testid="skeleton-card"
      className={cn(
        'rounded-3xl border border-black/5 bg-white p-6 shadow-sm space-y-4',
        className
      )}
    >
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-2xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="h-2 w-1/2" />
        </div>
      </div>
      <SkeletonText lines={2} lastLineWidth="60%" />
    </div>
  );
}

function SkeletonAvatar({ size = 40 }: { size?: number }) {
  return (
    <Skeleton
      data-testid="skeleton-avatar"
      className="rounded-full"
      style={{ width: size, height: size }}
    />
  );
}

function SkeletonListItem({ className }: { className?: string }) {
  return (
    <div
      data-testid="skeleton-list-item"
      className={cn(
        'flex items-center gap-3 rounded-2xl border border-black/5 bg-white p-4 shadow-sm',
        className
      )}
    >
      <Skeleton className="h-12 w-12 rounded-2xl shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-2 w-1/2" />
      </div>
    </div>
  );
}

export { Skeleton, SkeletonText, SkeletonCard, SkeletonAvatar, SkeletonListItem };
