import { Skeleton, SkeletonCard, SkeletonToggle, SkeletonHeader, SkeletonSection } from '@/components/ui/skeleton';

export function GeneralSettingsSkeleton() {
  return (
    <div className="space-y-6">
      <SkeletonHeader />
      
      <div className="space-y-4">
        {/* Theme selection skeleton */}
        <div className="space-y-3">
          <Skeleton className="h-5 w-1/4" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[1, 2, 3].map(i => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
        
        {/* Toggle settings skeleton */}
        <div className="space-y-3">
          <Skeleton className="h-5 w-1/4" />
          {[1, 2, 3, 4].map(i => (
            <SkeletonToggle key={i} />
          ))}
        </div>
        
        {/* Auto-save section skeleton */}
        <div className="space-y-3">
          <Skeleton className="h-5 w-1/4" />
          <SkeletonToggle />
          <div className="p-3 rounded-lg bg-white/30 dark:bg-gray-800/30 border border-gray-200/50 dark:border-gray-700/50">
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
            <div className="flex items-center gap-3 mt-3">
              <Skeleton className="h-1.5 flex-1 rounded-lg" />
              <Skeleton className="h-4 w-8" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AzureSettingsSkeleton() {
  return (
    <div className="space-y-8">
      <SkeletonHeader />
      
      {/* API Key Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Skeleton className="w-5 h-5 rounded" />
          <Skeleton className="h-5 w-20" />
        </div>
        
        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <div className="space-y-4">
            <div>
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-12 w-full rounded-lg" />
              <Skeleton className="h-3 w-64 mt-1" />
            </div>
            <Skeleton className="h-10 w-40 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Endpoints Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="w-5 h-5 rounded" />
            <Skeleton className="h-5 w-20" />
          </div>
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
        
        <div className="space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-lg" />
                  <div>
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="w-8 h-8 rounded-lg" />
                  <Skeleton className="w-8 h-8 rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AdvancedSettingsSkeleton() {
  return (
    <div className="space-y-8">
      <SkeletonHeader />
      
      {/* Data Management */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Skeleton className="w-5 h-5 rounded" />
          <Skeleton className="h-5 w-32" />
        </div>
        
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <div>
                <Skeleton className="h-4 w-24 mb-1" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="h-10 w-24 rounded-lg" />
            </div>
          ))}
        </div>
      </div>

      {/* System Information */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Skeleton className="w-5 h-5 rounded" />
          <Skeleton className="h-5 w-32" />
        </div>
        
        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="space-y-1">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reset Settings */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Skeleton className="w-5 h-5 rounded" />
          <Skeleton className="h-5 w-28" />
        </div>
        
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-4 w-32 mb-1" />
              <Skeleton className="h-3 w-64" />
            </div>
            <Skeleton className="h-10 w-24 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function AboutSettingsSkeleton() {
  return (
    <div className="space-y-8">
      <SkeletonHeader />
      
      {/* Application Info */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Skeleton className="w-5 h-5 rounded" />
          <Skeleton className="h-5 w-40" />
        </div>
        
        <div className="p-6 rounded-xl bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-800">
          <div className="flex items-start gap-4">
            <Skeleton className="w-16 h-16 rounded-2xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Skeleton className="w-5 h-5 rounded" />
          <Skeleton className="h-5 w-24" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <div className="flex items-start gap-3">
                <Skeleton className="w-8 h-8 rounded" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Author Info */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Skeleton className="w-5 h-5 rounded" />
          <Skeleton className="h-5 w-20" />
        </div>
        
        <div className="p-6 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <Skeleton className="w-16 h-16 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-full" />
              <div className="flex items-center gap-4">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-8 w-20 rounded-lg" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Current Settings */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Skeleton className="w-5 h-5 rounded" />
          <Skeleton className="h-5 w-32" />
        </div>
        
        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="space-y-1">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
