import { Star, Trophy, Award } from "lucide-react";
import { cn } from "@/lib/utils";

interface BadgeLevel {
  level: number;
  name: string;
  color: string;
  bgColor: string;
  borderColor: string;
  requiredComments: number;
}

const BADGE_LEVELS: BadgeLevel[] = [
  { level: 1, name: 'Bronze', color: 'text-amber-700', bgColor: 'bg-amber-100', borderColor: 'border-amber-300', requiredComments: 5 },
  { level: 2, name: 'Silber', color: 'text-slate-500', bgColor: 'bg-slate-100', borderColor: 'border-slate-300', requiredComments: 10 },
  { level: 3, name: 'Gold', color: 'text-yellow-500', bgColor: 'bg-yellow-100', borderColor: 'border-yellow-300', requiredComments: 25 },
  { level: 4, name: 'Platin', color: 'text-purple-500', bgColor: 'bg-purple-100', borderColor: 'border-purple-300', requiredComments: 50 },
  { level: 5, name: 'Diamant', color: 'text-cyan-500', bgColor: 'bg-cyan-100', borderColor: 'border-cyan-300', requiredComments: 100 },
];

interface BadgeProgressProps {
  currentComments: number;
  currentBadgeLevel: number;
}

export const BadgeProgress = ({ currentComments, currentBadgeLevel }: BadgeProgressProps) => {
  // Find the next badge to unlock
  const nextBadge = BADGE_LEVELS.find(b => b.level > currentBadgeLevel);
  const progressToNext = nextBadge 
    ? Math.min(100, (currentComments / nextBadge.requiredComments) * 100)
    : 100;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-foreground flex items-center gap-2">
          <Trophy className="w-4 h-4 md:w-5 md:h-5 text-primary" />
          Auszeichnungen
        </h3>
        <span className="text-xs text-muted-foreground">
          {currentComments} Kommentare
        </span>
      </div>

      {/* Badge Grid */}
      <div className="grid grid-cols-5 gap-1.5 md:gap-2">
        {BADGE_LEVELS.map((badge) => {
          const isUnlocked = currentBadgeLevel >= badge.level;
          const isCurrent = currentBadgeLevel === badge.level;
          
          return (
            <div
              key={badge.level}
              className={cn(
                "flex flex-col items-center p-1.5 md:p-2 rounded-lg border transition-all",
                isUnlocked 
                  ? `${badge.bgColor} ${badge.borderColor}` 
                  : "bg-secondary/50 border-border opacity-50"
              )}
            >
              <div className={cn(
                "w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center mb-1",
                isUnlocked ? badge.bgColor : "bg-muted"
              )}>
                <Star className={cn(
                  "w-3 h-3 md:w-4 md:h-4",
                  isUnlocked ? `${badge.color} fill-current` : "text-muted-foreground"
                )} />
              </div>
              <span className={cn(
                "text-[10px] md:text-xs font-medium text-center",
                isUnlocked ? badge.color : "text-muted-foreground"
              )}>
                {badge.name}
              </span>
              <span className="text-[8px] md:text-[10px] text-muted-foreground">
                {badge.requiredComments}+
              </span>
              {isCurrent && (
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-primary mt-0.5 animate-pulse" />
              )}
            </div>
          );
        })}
      </div>

      {/* Progress to next badge */}
      {nextBadge && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              Nächstes: <span className={nextBadge.color}>{nextBadge.name}</span>
            </span>
            <span className="text-muted-foreground">
              {currentComments}/{nextBadge.requiredComments}
            </span>
          </div>
          <div className="h-1.5 md:h-2 bg-secondary rounded-full overflow-hidden">
            <div 
              className={cn("h-full rounded-full transition-all duration-500", nextBadge.bgColor)}
              style={{ width: `${progressToNext}%` }}
            />
          </div>
          <p className="text-[10px] md:text-xs text-muted-foreground text-center">
            Noch {nextBadge.requiredComments - currentComments} Kommentare bis zum {nextBadge.name}-Badge
          </p>
        </div>
      )}

      {currentBadgeLevel >= 5 && (
        <div className="flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-lg border border-cyan-500/30">
          <Award className="w-5 h-5 text-cyan-500" />
          <span className="text-sm font-medium text-cyan-500">
            Maximaler Rang erreicht!
          </span>
        </div>
      )}
    </div>
  );
};
