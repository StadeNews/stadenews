import { cn } from "@/lib/utils";

interface SkeletonCardProps {
  className?: string;
}

export const NewsCardSkeleton = ({ className }: SkeletonCardProps) => {
  return (
    <div className={cn("glass-card p-4 space-y-3", className)}>
      <div className="flex items-center gap-2">
        <div className="skeleton-shimmer h-5 w-20 rounded-full" />
        <div className="skeleton-shimmer h-4 w-16 rounded" />
      </div>
      <div className="skeleton-shimmer h-6 w-3/4 rounded" />
      <div className="space-y-2">
        <div className="skeleton-shimmer h-4 w-full rounded" />
        <div className="skeleton-shimmer h-4 w-5/6 rounded" />
      </div>
      <div className="flex items-center gap-4 pt-2">
        <div className="skeleton-shimmer h-8 w-16 rounded-lg" />
        <div className="skeleton-shimmer h-8 w-16 rounded-lg" />
        <div className="skeleton-shimmer h-8 w-16 rounded-lg" />
      </div>
    </div>
  );
};

export const CategoryCardSkeleton = ({ className }: SkeletonCardProps) => {
  return (
    <div className={cn("glass-card p-5 space-y-3", className)}>
      <div className="skeleton-shimmer h-12 w-12 rounded-xl" />
      <div className="skeleton-shimmer h-5 w-2/3 rounded" />
      <div className="skeleton-shimmer h-4 w-full rounded" />
      <div className="skeleton-shimmer h-4 w-16 rounded-full" />
    </div>
  );
};

export const ChatMessageSkeleton = () => {
  return (
    <div className="flex gap-3 animate-pulse">
      <div className="skeleton-shimmer h-8 w-8 rounded-full flex-shrink-0" />
      <div className="space-y-2 flex-1">
        <div className="skeleton-shimmer h-4 w-24 rounded" />
        <div className="skeleton-shimmer h-16 w-full max-w-xs rounded-xl" />
      </div>
    </div>
  );
};
