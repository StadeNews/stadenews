import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, MapPin, Calendar, Clock, Flag } from 'lucide-react';
import { toggleSpottedLike, checkSpottedLiked } from '@/lib/spotted-api';
import { useAuth } from '@/hooks/useAuth';
import { useAnonymousId } from '@/hooks/useAnonymousId';
import { useToast } from '@/hooks/use-toast';
import { ReportModal } from '@/components/shared/ReportModal';
import type { Spotted } from '@/types/spotted';

interface SpottedCardProps {
  spotted: Spotted;
  showFullContent?: boolean;
}

export const SpottedCard = ({ spotted, showFullContent = false }: SpottedCardProps) => {
  const { user } = useAuth();
  const { anonymousId } = useAnonymousId();
  const { toast } = useToast();
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(spotted.likes_count);
  const [isReporting, setIsReporting] = useState(false);

  useEffect(() => {
    const checkLike = async () => {
      const hasLiked = await checkSpottedLiked(spotted.id, user?.id, anonymousId);
      setLiked(hasLiked);
    };
    checkLike();
  }, [spotted.id, user?.id, anonymousId]);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const nowLiked = await toggleSpottedLike(spotted.id, user?.id, anonymousId);
      setLiked(nowLiked);
      setLikesCount(prev => nowLiked ? prev + 1 : prev - 1);
    } catch (error) {
      toast({ title: "Fehler", variant: "destructive" });
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <>
      <Link to={`/spotted/${spotted.id}`} className="block">
        <article className="news-card p-4 hover-lift">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1">
              <h3 className="font-display font-bold text-lg text-headline line-clamp-2">
                {spotted.title}
              </h3>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
                {spotted.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {spotted.location}
                  </span>
                )}
                {spotted.spotted_date && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(spotted.spotted_date)}
                  </span>
                )}
                {spotted.spotted_time && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {spotted.spotted_time}
                  </span>
                )}
              </div>
            </div>
            <span className="px-2 py-1 bg-pink-500/20 text-pink-600 rounded-full text-xs font-medium">
              Spotted
            </span>
          </div>

          {/* Content */}
          <p className={`text-sm text-muted-foreground mb-4 ${showFullContent ? '' : 'line-clamp-3'}`}>
            {spotted.content}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <div className="flex items-center gap-4">
              <button
                onClick={handleLike}
                className={`flex items-center gap-1.5 text-sm transition-colors ${
                  liked ? 'text-pink-500' : 'text-muted-foreground hover:text-pink-500'
                }`}
              >
                <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
                {likesCount}
              </button>
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <MessageCircle className="w-4 h-4" />
                Kommentare
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsReporting(true);
                }}
                className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                title="Melden"
              >
                <Flag className="w-4 h-4" />
              </button>
              <span className="text-xs text-muted-foreground">
                {spotted.anonymous_author || spotted.profile?.username || 'Anonym'}
              </span>
            </div>
          </div>
        </article>
      </Link>

      <ReportModal
        isOpen={isReporting}
        onClose={() => setIsReporting(false)}
        contentType="story"
        contentId={spotted.id}
      />
    </>
  );
};
