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
import { fetchSpottedById, fetchSpottedComments, addSpottedComment, submitSpottedResponse, deleteSpottedPost, deleteSpottedComment } from '@/lib/spotted-api';
import { generateNickname } from '@/hooks/useAnonymousId';
import { ArrowLeft, Send, Flag, Heart, Mail, Trash2, Loader2 } from 'lucide-react';
import type { Spotted, SpottedComment } from '@/types/spotted';

const SpottedDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isAdmin } = useAuth();
  const { preferAnonymous, savePreference } = useAnonymousPreference();
  const { toast } = useToast();
  
  const [spotted, setSpotted] = useState<Spotted | null>(null);
  const [comments, setComments] = useState<SpottedComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [reportingCommentId, setReportingCommentId] = useState<string | null>(null);
  const [showPrivateReplyModal, setShowPrivateReplyModal] = useState(false);
  const [privateReply, setPrivateReply] = useState({ message: '', contact: '' });
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);

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

  const handlePrivateReply = async () => {
    if (!privateReply.message.trim() || !id) return;
    
    setIsSubmittingReply(true);
    try {
      await submitSpottedResponse({
        spotted_id: id,
        message: privateReply.message.trim(),
        contact_info: privateReply.contact.trim() || undefined,
        user_id: user?.id,
        anonymous_author: !user ? generateNickname() : undefined
      });
      
      toast({ title: "Private Antwort gesendet!" });
      setShowPrivateReplyModal(false);
      setPrivateReply({ message: '', contact: '' });
    } catch (error) {
      toast({ title: "Fehler", variant: "destructive" });
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Kommentar wirklich löschen?')) return;
    
    setDeletingCommentId(commentId);
    try {
      await deleteSpottedComment(commentId);
      setComments(comments.filter(c => c.id !== commentId));
      toast({ title: "Kommentar gelöscht" });
    } catch (error) {
      toast({ title: "Fehler beim Löschen", variant: "destructive" });
    } finally {
      setDeletingCommentId(null);
    }
  };

  const handleDeleteSpotted = async () => {
    if (!spotted || !confirm('Diesen Spotted-Post wirklich löschen?')) return;
    
    try {
      await deleteSpottedPost(spotted.id);
      toast({ title: "Spotted-Post gelöscht" });
      window.location.href = '/spotted';
    } catch (error) {
      toast({ title: "Fehler beim Löschen", variant: "destructive" });
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
        <div className="flex items-center justify-between mb-6">
          <Link to="/spotted" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" /> Zurück zu Spotted
          </Link>
          {isAdmin && (
            <button
              onClick={handleDeleteSpotted}
              className="flex items-center gap-2 px-3 py-1.5 bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 text-sm"
            >
              <Trash2 className="w-4 h-4" /> Löschen
            </button>
          )}
        </div>

        <SpottedCard spotted={spotted} showFullContent />

        {/* Private Reply Button */}
        <div className="mt-4">
          <button
            onClick={() => setShowPrivateReplyModal(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-pink-500/10 border border-pink-500/30 text-pink-500 rounded-xl hover:bg-pink-500/20 transition-colors"
          >
            <Mail className="w-5 h-5" />
            Das bin ich! Privat antworten
          </button>
        </div>

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
                  <div className="flex items-center gap-1">
                    {isAdmin && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        disabled={deletingCommentId === comment.id}
                        className="p-1.5 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                        title="Löschen"
                      >
                        {deletingCommentId === comment.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => setReportingCommentId(comment.id)}
                      className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                      title="Melden"
                    >
                      <Flag className="w-4 h-4" />
                    </button>
                  </div>
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

      {/* Private Reply Modal */}
      {showPrivateReplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setShowPrivateReplyModal(false)} />
          
          <div className="relative glass-card w-full max-w-md p-6 animate-scale-in">
            <button
              onClick={() => setShowPrivateReplyModal(false)}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-secondary"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-pink-500/20 flex items-center justify-center">
                <Heart className="w-6 h-6 text-pink-500" />
              </div>
              <div>
                <h2 className="font-display text-xl font-bold">Private Antwort</h2>
                <p className="text-sm text-muted-foreground">Nur der Ersteller sieht diese Nachricht</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Deine Nachricht *</label>
                <textarea
                  value={privateReply.message}
                  onChange={(e) => setPrivateReply({ ...privateReply, message: e.target.value })}
                  placeholder="Hey, ich glaube du meinst mich..."
                  rows={4}
                  className="w-full px-4 py-3 bg-secondary border border-border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Kontakt (optional)</label>
                <input
                  type="text"
                  value={privateReply.contact}
                  onChange={(e) => setPrivateReply({ ...privateReply, contact: e.target.value })}
                  placeholder="Instagram, Snapchat, Telefonnummer..."
                  className="w-full px-4 py-3 bg-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Falls du möchtest, dass die Person dich kontaktieren kann
                </p>
              </div>

              <button
                onClick={handlePrivateReply}
                disabled={!privateReply.message.trim() || isSubmittingReply}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-pink-500 text-white rounded-xl disabled:opacity-50"
              >
                {isSubmittingReply ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Mail className="w-5 h-5" />
                    Privat senden
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

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
        contentType="spotted_comment"
        contentId={reportingCommentId || ''}
      />
    </MainLayout>
  );
};

export default SpottedDetailPage;
