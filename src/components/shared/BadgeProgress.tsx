import { Star, Trophy, Award, FileText, Heart, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserBadge, BadgeType } from "./UserBadge";

interface BadgeLevel {
  level: number;
  name: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

const BADGE_LEVELS: BadgeLevel[] = [
  { level: 1, name: 'Bronze', color: 'text-amber-700', bgColor: 'bg-amber-100', borderColor: 'border-amber-300' },
  { level: 2, name: 'Silber', color: 'text-slate-500', bgColor: 'bg-slate-100', borderColor: 'border-slate-300' },
  { level: 3, name: 'Gold', color: 'text-yellow-500', bgColor: 'bg-yellow-100', borderColor: 'border-yellow-300' },
  { level: 4, name: 'Platin', color: 'text-purple-500', bgColor: 'bg-purple-100', borderColor: 'border-purple-300' },
  { level: 5, name: 'Diamant', color: 'text-cyan-500', bgColor: 'bg-cyan-100', borderColor: 'border-cyan-300' },
];

interface BadgeCategory {
  type: BadgeType;
  label: string;
  icon: typeof MessageSquare;
  thresholds: number[];
}

const BADGE_CATEGORIES: BadgeCategory[] = [
  { 
    type: 'commenter', 
    label: 'Kommentator', 
    icon: MessageSquare,
    thresholds: [5, 10, 25, 50, 100]
  },
  { 
    type: 'storyteller', 
    label: 'Geschichtenerzähler', 
    icon: FileText,
    thresholds: [1, 5, 10, 25, 50]
  },
  { 
    type: 'popular', 
    label: 'Beliebt', 
    icon: Heart,
    thresholds: [10, 50, 100, 200, 500]
  },
];

interface BadgeProgressProps {
  currentComments: number;
  currentStories?: number;
  currentLikes?: number;
  badges: { badge_type: string; badge_level: number }[];
}

export const BadgeProgress = ({ 
  currentComments, 
  currentStories = 0, 
  currentLikes = 0,
  badges 
}: BadgeProgressProps) => {
  const getBadgeLevel = (type: string) => {
    const badge = badges.find(b => b.badge_type === type);
    return badge?.badge_level || 0;
  };

  const getCurrentValue = (type: BadgeType) => {
    switch (type) {
      case 'commenter': return currentComments;
      case 'storyteller': return currentStories;
      case 'popular': return currentLikes;
      default: return 0;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-foreground flex items-center gap-2">
          <Trophy className="w-4 h-4 md:w-5 md:h-5 text-primary" />
          Auszeichnungen
        </h3>
      </div>

      {/* Badge Categories */}
      <div className="space-y-4">
        {BADGE_CATEGORIES.map(category => {
          const currentLevel = getBadgeLevel(category.type);
          const currentValue = getCurrentValue(category.type);
          const nextThresholdIndex = category.thresholds.findIndex((t, i) => i >= currentLevel);
          const nextThreshold = nextThresholdIndex >= 0 ? category.thresholds[nextThresholdIndex] : null;
          const progressToNext = nextThreshold 
            ? Math.min(100, (currentValue / nextThreshold) * 100)
            : 100;

          const Icon = category.icon;

          return (
            <div key={category.type} className="bg-secondary/30 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-primary" />
                  <span className="text-xs md:text-sm font-medium">{category.label}</span>
                </div>
                <span className="text-[10px] md:text-xs text-muted-foreground">
                  {currentValue} {category.type === 'commenter' ? 'Komm.' : category.type === 'storyteller' ? 'Stories' : 'Likes'}
                </span>
              </div>

              {/* Badge Grid */}
              <div className="flex gap-1 mb-2">
                {BADGE_LEVELS.map((badge, index) => {
                  const isUnlocked = currentLevel >= badge.level;
                  const threshold = category.thresholds[index];
                  
                  return (
                    <div
                      key={badge.level}
                      className={cn(
                        "flex-1 flex flex-col items-center p-1.5 rounded-lg border transition-all",
                        isUnlocked 
                          ? `${badge.bgColor} ${badge.borderColor}` 
                          : "bg-muted/50 border-border opacity-40"
                      )}
                      title={`${badge.name}: ${threshold}+ ${category.type === 'commenter' ? 'Kommentare' : category.type === 'storyteller' ? 'Stories' : 'Likes'}`}
                    >
                      <UserBadge type={category.type} level={badge.level} size="sm" />
                      <span className="text-[8px] md:text-[10px] text-muted-foreground mt-0.5">
                        {threshold}+
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Progress bar */}
              {nextThreshold && currentLevel < 5 && (
                <div className="space-y-1">
                  <div className="h-1 md:h-1.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        BADGE_LEVELS[currentLevel]?.bgColor || 'bg-primary'
                      )}
                      style={{ width: `${progressToNext}%` }}
                    />
                  </div>
                  <p className="text-[9px] md:text-[10px] text-muted-foreground text-center">
                    Noch {nextThreshold - currentValue} bis {BADGE_LEVELS[currentLevel]?.name || 'Bronze'}
                  </p>
                </div>
              )}

              {currentLevel >= 5 && (
                <div className="flex items-center justify-center gap-1 py-1">
                  <Award className="w-3 h-3 text-cyan-500" />
                  <span className="text-[10px] font-medium text-cyan-500">Max erreicht!</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
