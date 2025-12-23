import { Crown, Star, FileText, Heart, Award } from "lucide-react";
import { cn } from "@/lib/utils";

export type BadgeType = 'admin' | 'commenter' | 'storyteller' | 'popular';

interface BadgeLevel {
  level: number;
  name: string;
  color: string;
  bgColor: string;
}

const BADGE_LEVELS: BadgeLevel[] = [
  { level: 1, name: 'Bronze', color: 'text-amber-700', bgColor: 'bg-amber-100' },
  { level: 2, name: 'Silber', color: 'text-slate-500', bgColor: 'bg-slate-100' },
  { level: 3, name: 'Gold', color: 'text-yellow-500', bgColor: 'bg-yellow-100' },
  { level: 4, name: 'Platin', color: 'text-purple-500', bgColor: 'bg-purple-100' },
  { level: 5, name: 'Diamant', color: 'text-cyan-500', bgColor: 'bg-cyan-100' },
];

const BADGE_ICONS: Record<string, typeof Star> = {
  commenter: Star,
  storyteller: FileText,
  popular: Heart,
};

interface UserBadgeProps {
  type: BadgeType;
  level?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const UserBadge = ({ type, level = 1, size = 'sm', showLabel = false, className }: UserBadgeProps) => {
  const sizeClasses = {
    sm: 'w-3 h-3 md:w-4 md:h-4',
    md: 'w-4 h-4 md:w-5 md:h-5',
    lg: 'w-5 h-5 md:w-6 md:h-6',
  };

  const containerSizeClasses = {
    sm: 'w-4 h-4 md:w-5 md:h-5',
    md: 'w-5 h-5 md:w-6 md:h-6',
    lg: 'w-6 h-6 md:w-8 md:h-8',
  };

  if (type === 'admin') {
    return (
      <div className={cn(
        "inline-flex items-center gap-1",
        className
      )}>
        <div className={cn(
          containerSizeClasses[size],
          "rounded-full bg-amber-400 flex items-center justify-center shadow-sm"
        )}>
          <Crown className={cn(sizeClasses[size], "text-amber-900")} />
        </div>
        {showLabel && (
          <span className="text-xs font-medium text-amber-500">Admin</span>
        )}
      </div>
    );
  }

  // Handle commenter, storyteller, popular badges
  const Icon = BADGE_ICONS[type] || Star;
  const badge = BADGE_LEVELS.find(b => b.level === level) || BADGE_LEVELS[0];
  
  return (
    <div className={cn(
      "inline-flex items-center gap-1",
      className
    )}>
      <div className={cn(
        containerSizeClasses[size],
        "rounded-full flex items-center justify-center shadow-sm",
        badge.bgColor
      )}>
        <Icon className={cn(sizeClasses[size], badge.color, "fill-current")} />
      </div>
      {showLabel && (
        <span className={cn("text-xs font-medium", badge.color)}>{badge.name}</span>
      )}
    </div>
  );
};

// Admin Crown Icon - standalone version
export const AdminCrown = ({ size = 'sm', className }: { size?: 'sm' | 'md' | 'lg'; className?: string }) => (
  <UserBadge type="admin" size={size} className={className} />
);

// Hook to get badge info
export const getBadgeInfo = (level: number) => {
  return BADGE_LEVELS.find(b => b.level === level) || null;
};

// Export badge levels for use in other components
export const BADGE_LEVEL_INFO = BADGE_LEVELS;
