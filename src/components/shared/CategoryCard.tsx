import { Link } from "react-router-dom";
import { Siren, MessageSquare, AlertTriangle, PartyPopper, VolumeX, Heart, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Category } from "@/types/database";

const iconMap: Record<string, LucideIcon> = {
  Siren,
  MessageSquare,
  AlertTriangle,
  PartyPopper,
  VolumeX,
  Heart,
};

interface CategoryCardProps {
  category: Category;
  count: number;
  className?: string;
}

export const CategoryCard = ({ category, count, className }: CategoryCardProps) => {
  const Icon = iconMap[category.icon] || MessageSquare;
  
  return (
    <Link
      to={`/news?kategorie=${category.slug}`}
      className={cn(
        "glass-card p-5 hover-lift group block",
        className
      )}
    >
      <div className={cn(
        "w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:neon-glow-sm",
        category.color
      )}>
        <Icon className="w-6 h-6" />
      </div>
      
      <h3 className="font-display font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
        {category.name}
      </h3>
      
      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
        {category.description}
      </p>
      
      <span className="inline-flex items-center px-2.5 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
        {count} Beiträge
      </span>
    </Link>
  );
};
