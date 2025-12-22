import { useState } from "react";
import { ThumbsUp, Flag, Share2, Clock, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useAnonymousId } from "@/hooks/useAnonymousId";
import { toggleLike, checkUserLiked } from "@/lib/api";
import { Story } from "@/types/database";
import { AuthModal } from "@/components/auth/AuthModal";
import { useEffect } from "react";

interface NewsCardProps {
  story: Story;
  className?: string;
  showCommentLink?: boolean;
}

export const NewsCard = ({ story, className, showCommentLink = true }: NewsCardProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { anonymousId } = useAnonymousId();
  const [likesCount, setLikesCount] = useState(story.likes_count);
  const [hasLiked, setHasLiked] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<'like' | null>(null);

  useEffect(() => {
    const checkLike = async () => {
      const liked = await checkUserLiked(story.id, user?.id, anonymousId);
      setHasLiked(liked);
    };
    if (anonymousId || user?.id) {
      checkLike();
    }
  }, [story.id, user?.id, anonymousId]);

  const handleLike = async (asAnonymous: boolean = false) => {
    try {
      const userId = asAnonymous ? undefined : user?.id;
      const anonId = asAnonymous ? anonymousId : undefined;
      
      const nowLiked = await toggleLike(story.id, userId, anonId);
      setHasLiked(nowLiked);
      setLikesCount(prev => nowLiked ? prev + 1 : prev - 1);
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Like konnte nicht gespeichert werden.",
        variant: "destructive"
      });
    }
  };

  const onLikeClick = () => {
    if (!user && !hasLiked) {
      setPendingAction('like');
      setShowAuthModal(true);
    } else {
      handleLike(false);
    }
  };

  const handleReport = () => {
    toast({
      title: "Meldung eingegangen",
      description: "Danke für dein Feedback. Wir prüfen den Beitrag.",
    });
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/story/${story.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: story.title || 'Stade News Story',
          text: story.content.substring(0, 100) + '...',
          url: shareUrl,
        });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link kopiert!",
        description: "Der Stade News Link wurde in die Zwischenablage kopiert.",
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return 'gerade eben';
    if (diffHours < 24) return `vor ${diffHours} Std.`;
    if (diffDays < 7) return `vor ${diffDays} Tag${diffDays > 1 ? 'en' : ''}`;
    return date.toLocaleDateString('de-DE');
  };

  const category = story.category;

  return (
    <>
      <article className={cn(
        "news-card p-5 hover-lift group",
        story.is_breaking && "border-destructive/50 bg-destructive/5",
        className
      )}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          {story.is_breaking && (
            <span className="breaking-badge">
              EILMELDUNG
            </span>
          )}
          {category && (
            <span className="category-tag">
              {category.name}
            </span>
          )}
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            {formatDate(story.published_at || story.created_at)}
          </span>
        </div>

        {/* Content */}
        <Link to={`/story/${story.id}`}>
          <h3 className="font-display font-bold text-lg mb-2 group-hover:text-primary transition-colors text-headline">
            {story.title || 'Neue Story'}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-3">
            {story.content}
          </p>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onLikeClick}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 min-h-[40px]",
              hasLiked 
                ? "bg-primary/10 text-primary" 
                : "bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
            )}
          >
            <ThumbsUp className={cn("w-4 h-4", hasLiked && "fill-current")} />
            <span>{likesCount}</span>
          </button>

          {showCommentLink && (
            <Link
              to={`/story/${story.id}#comments`}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground transition-all duration-200 min-h-[40px]"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Kommentare</span>
            </Link>
          )}
          
          <button
            onClick={handleReport}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-secondary text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200 min-h-[40px]"
          >
            <Flag className="w-4 h-4" />
            <span className="hidden sm:inline">Melden</span>
          </button>
          
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground transition-all duration-200 min-h-[40px]"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Teilen</span>
          </button>
        </div>
      </article>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => {
          setShowAuthModal(false);
          setPendingAction(null);
        }}
        onContinueAnonymous={() => {
          if (pendingAction === 'like') {
            handleLike(true);
          }
          setPendingAction(null);
        }}
        title="Liken"
      />
    </>
  );
};