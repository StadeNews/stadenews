import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { SpottedCard } from '@/components/spotted/SpottedCard';
import { NewsCardSkeleton } from '@/components/shared/SkeletonLoaders';
import { AuthModal } from '@/components/auth/AuthModal';
import { ReportModal } from '@/components/shared/ReportModal';
import { useAuth } from '@/hooks/useAuth';
import { useAnonymousPreference } from '@/hooks/useAnonymousPreference';
import { useToast } from '@/hooks/use-toast';
import { fetchSpottedById, fetchSpottedComments, addSpottedComment } from '@/lib/spotted-api';
import { generateNickname } from '@/hooks/useAnonymousId';
import { ArrowLeft, Send, Flag } from 'lucide-react';
import type { Spotted, SpottedComment } from '@/types/spotted';

const SpottedDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { preferAnonymous, savePreference } = useAnonymousPreference();
  const { toast } = useToast();
  
  const [spotted, setSpotted] = useState<Spotted | null>(null);
  const [comments, setComments] = useState<SpottedComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [reportingCommentId, setReportingCommentId] = useState<string | null>(null);

  useEffect(() => {
    if (id) loadData();
  }, [id]);

  const loadData = async () => {
    if (!id) return;
    
    try {
      const [spottedData, commentsData] = await Promise.all([
        fetchSpottedById(id),
        fetchSpottedComments(id)
      ]);
      setSpotted(spottedData);
      setComments(commentsData);
    } catch (error) {
      console.error('Error loading spotted:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async (asAnonymous: boolean) => {
    if (!newComment.trim() || !id) return;
    
    setIsSubmitting(true);
    try {
      await addSpottedComment({
        spotted_id: id,
        content: newComment.trim(),
        user_id: asAnonymous ? undefined : user?.id,
        anonymous_author: asAnonymous ? generateNickname() : undefined
      });
      
      const updatedComments = await fetchSpottedComments(id);
      setComments(updatedComments);
      setNewComment('');
      toast({ title: "Kommentar gesendet!" });
    } catch (error) {
      toast({ title: "Fehler", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onCommentSubmit = () => {
    if (preferAnonymous === true) {
      handleSubmitComment(true);
    } else if (!user) {
      setShowAuthModal(true);
    } else {
      handleSubmitComment(false);
    }
  };

  const handleAuthModalClose = (action?: 'login' | 'anonymous') => {
    setShowAuthModal(false);
    if (action === 'anonymous') {
      savePreference(true);
      handleSubmitComment(true);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <NewsCardSkeleton />
        </div>
      </MainLayout>
    );
  }

  if (!spotted) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-muted-foreground">Spotted-Post nicht gefunden.</p>
          <Link to="/spotted" className="text-primary hover:underline mt-4 inline-block">
            Zurück zu Spotted
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Link to="/spotted" className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Zurück zu Spotted
        </Link>

        <SpottedCard spotted={spotted} showFullContent />

        {/* Comments Section */}
        <div id="comments" className="mt-8">
          <h3 className="font-display text-xl font-bold mb-4">Kommentare ({comments.length})</h3>
          
          {/* Comment Input */}
          <div className="glass-card p-4 mb-6">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Schreibe einen Kommentar..."
              rows={3}
              className="w-full px-4 py-3 bg-secondary border border-border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <div className="flex justify-end mt-3">
              <button
                onClick={onCommentSubmit}
                disabled={!newComment.trim() || isSubmitting}
                className="flex items-center gap-2 px-4 py-2 bg-pink-500 text-white rounded-lg disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                Senden
              </button>
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="glass-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-pink-500">
                      {comment.anonymous_author || comment.profile?.username || 'Anonym'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(comment.created_at).toLocaleDateString('de-DE')}
                    </span>
                  </div>
                  <button
                    onClick={() => setReportingCommentId(comment.id)}
                    className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                    title="Melden"
                  >
                    <Flag className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm">{comment.content}</p>
              </div>
            ))}
            {comments.length === 0 && (
              <p className="text-center text-muted-foreground py-8">Noch keine Kommentare.</p>
            )}
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => handleAuthModalClose()}
        onContinueAnonymous={() => handleAuthModalClose('anonymous')}
        title="Kommentieren"
        showAnonymousOption={true}
      />

      <ReportModal
        isOpen={!!reportingCommentId}
        onClose={() => setReportingCommentId(null)}
        contentType="comment"
        contentId={reportingCommentId || ''}
      />
    </MainLayout>
  );
};

export default SpottedDetailPage;
