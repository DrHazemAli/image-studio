import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-gray-200 dark:bg-gray-700',
        className
      )}
      {...props}
    />
  );
}

// Pre-built skeleton components for common patterns
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50', className)}>
      <div className="flex items-center gap-3">
        <Skeleton className="w-8 h-8 rounded-lg" />
        <div className="flex-1 space-y-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-full" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonToggle({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center justify-between p-3 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50', className)}>
      <div className="space-y-1">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-48" />
      </div>
      <Skeleton className="w-9 h-5 rounded-full" />
    </div>
  );
}

export function SkeletonHeader({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-2', className)}>
      <Skeleton className="h-6 w-1/3" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}

export function SkeletonSection({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-3', className)}>
      <Skeleton className="h-5 w-1/4" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}
