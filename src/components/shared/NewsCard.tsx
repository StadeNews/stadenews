import { ThumbsUp, Flag, Share2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export interface NewsItem {
  id: string;
  category: string;
  categoryColor: string;
  title: string;
  excerpt: string;
  timestamp: string;
  reactions: number;
}

interface NewsCardProps {
  news: NewsItem;
  className?: string;
}

export const NewsCard = ({ news, className }: NewsCardProps) => {
  const [reactions, setReactions] = useState(news.reactions);
  const [hasReacted, setHasReacted] = useState(false);
  const { toast } = useToast();

  const handleReaction = () => {
    if (hasReacted) {
      setReactions(prev => prev - 1);
      setHasReacted(false);
    } else {
      setReactions(prev => prev + 1);
      setHasReacted(true);
    }
  };

  const handleReport = () => {
    toast({
      title: "Meldung eingegangen",
      description: "Danke für dein Feedback. Wir prüfen den Beitrag.",
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: news.title,
          text: news.excerpt,
          url: window.location.href,
        });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link kopiert!",
        description: "Der Link wurde in die Zwischenablage kopiert.",
      });
    }
  };

  return (
    <article className={cn(
      "glass-card p-4 hover-lift group",
      className
    )}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <span 
          className={cn(
            "px-3 py-1 text-xs font-medium rounded-full",
            news.categoryColor
          )}
        >
          {news.category}
        </span>
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          {news.timestamp}
        </span>
      </div>

      {/* Content */}
      <h3 className="font-display font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
        {news.title}
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        {news.excerpt}
      </p>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleReaction}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all duration-200",
            hasReacted 
              ? "bg-primary/20 text-primary" 
              : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
          )}
        >
          <ThumbsUp className={cn("w-4 h-4", hasReacted && "fill-current")} />
          <span>{reactions}</span>
        </button>
        
        <button
          onClick={handleReport}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-secondary/50 text-muted-foreground hover:bg-destructive/20 hover:text-destructive transition-all duration-200"
        >
          <Flag className="w-4 h-4" />
          <span className="hidden sm:inline">Melden</span>
        </button>
        
        <button
          onClick={handleShare}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground transition-all duration-200"
        >
          <Share2 className="w-4 h-4" />
          <span className="hidden sm:inline">Teilen</span>
        </button>
      </div>
    </article>
  );
};
