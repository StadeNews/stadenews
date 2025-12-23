import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { NewsCard } from "@/components/shared/NewsCard";
import { NewsCardSkeleton } from "@/components/shared/SkeletonLoaders";
import { ArrowLeft, Send, Flag } from "lucide-react";
import { fetchStoryById, fetchComments, addComment } from "@/lib/api";
import { Story, Comment } from "@/types/database";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { AuthModal } from "@/components/auth/AuthModal";
import { ReportModal } from "@/components/shared/ReportModal";
import { generateNickname } from "@/hooks/useAnonymousId";
import { AdminCrown, UserBadge } from "@/components/shared/UserBadge";
import { checkMultipleAdminRoles } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";

const StoryPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [story, setStory] = useState<Story | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reportingCommentId, setReportingCommentId] = useState<string | null>(null);
  const [adminUsers, setAdminUsers] = useState<Set<string>>(new Set());
  const [userBadges, setUserBadges] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      setIsLoading(true);

      try {
        // Include user's own stories (permissions handled by backend policies)
        const storyData = await fetchStoryById(id, !!user);
        setStory(storyData);

        try {
          const commentsData = await fetchComments(id);
          setComments(commentsData);
          
          // Check admin status for all comment authors
          const userIds = commentsData
            .map(c => c.user_id)
            .filter((id): id is string => id !== null);
          
          if (userIds.length > 0) {
            const adminMap = await checkMultipleAdminRoles(userIds);
            const adminSet = new Set<string>();
            adminMap.forEach((isAdmin, id) => {
              if (isAdmin) adminSet.add(id);
            });
            setAdminUsers(adminSet);
            
            // Fetch badges for users
            const { data: badges } = await supabase
              .from('user_badges')
              .select('user_id, badge_level')
              .in('user_id', userIds)
              .eq('badge_type', 'commenter');
            
            const badgeMap = new Map<string, number>();
            (badges || []).forEach(b => {
              badgeMap.set(b.user_id, b.badge_level);
            });
            setUserBadges(badgeMap);
          }
        } catch (error) {
          console.error('Error loading comments:', error);
          setComments([]);
        }
      } catch (error) {
        console.error('Error loading story:', error);
        setStory(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id, user]);

  const handleSubmitComment = async (asAnonymous: boolean) => {
    if (!newComment.trim() || !id) return;
    
    setIsSubmitting(true);
    try {
      await addComment({
        story_id: id,
        content: newComment.trim(),
        user_id: asAnonymous ? undefined : user?.id,
        anonymous_author: asAnonymous ? generateNickname() : undefined
      });
      
      const updatedComments = await fetchComments(id);
      setComments(updatedComments);
      setNewComment("");
      toast({ title: "Kommentar gesendet!" });
    } catch (error) {
      toast({ title: "Fehler", description: "Kommentar konnte nicht gesendet werden.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onCommentSubmit = () => {
    if (!user) {
      setShowAuthModal(true);
    } else {
      handleSubmitComment(false);
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

  if (!story) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-muted-foreground">Story nicht gefunden.</p>
          <Link to="/news" className="text-primary hover:underline mt-4 inline-block">Zurück zu News</Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Link to="/news" className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Zurück
        </Link>

        <NewsCard story={story} showCommentLink={false} />

        {/* Comments Section - only for published stories */}
        {story.status === 'published' ? (
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
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  Senden
                </button>
              </div>
            </div>

            {/* Comments List */}
            <div className="space-y-4">
              {comments.map((comment) => {
                const isCommentAdmin = comment.user_id ? adminUsers.has(comment.user_id) : false;
                const badgeLevel = comment.user_id ? userBadges.get(comment.user_id) : undefined;
                
                return (
                  <div key={comment.id} className={`glass-card p-3 md:p-4 ${isCommentAdmin ? 'border border-amber-500/30' : ''}`}>
                    <div className="flex items-center justify-between mb-2 gap-2">
                      <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
                        {isCommentAdmin && <AdminCrown size="sm" />}
                        <span className={`text-sm font-medium ${isCommentAdmin ? 'text-amber-500' : 'text-primary'}`}>
                          {comment.anonymous_author || (comment.profile as any)?.username || 'Anonym'}
                        </span>
                        {badgeLevel && badgeLevel > 0 && (
                          <UserBadge type="commenter" level={badgeLevel} size="sm" />
                        )}
                        <span className="text-xs text-muted-foreground">
                          {new Date(comment.created_at).toLocaleDateString('de-DE')}
                        </span>
                      </div>
                      <button
                        onClick={() => setReportingCommentId(comment.id)}
                        className="p-1 md:p-1.5 text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                        title="Melden"
                      >
                        <Flag className="w-3 h-3 md:w-4 md:h-4" />
                      </button>
                    </div>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                );
              })}
              {comments.length === 0 && (
                <p className="text-center text-muted-foreground py-8">Noch keine Kommentare.</p>
              )}
            </div>
          </div>
        ) : (
          <div className="mt-8 glass-card p-6 text-center">
            <p className="text-muted-foreground">
              Kommentare sind nur für veröffentlichte Stories verfügbar.
            </p>
          </div>
        )}
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onContinueAnonymous={() => handleSubmitComment(true)}
        title="Kommentieren"
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

export default StoryPage;
