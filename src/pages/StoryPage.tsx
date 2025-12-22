import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { NewsCard } from "@/components/shared/NewsCard";
import { NewsCardSkeleton } from "@/components/shared/SkeletonLoaders";
import { ArrowLeft, Send } from "lucide-react";
import { fetchStoryById, fetchComments, addComment } from "@/lib/api";
import { Story, Comment } from "@/types/database";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { AuthModal } from "@/components/auth/AuthModal";
import { generateNickname } from "@/hooks/useAnonymousId";

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

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      try {
        const [storyData, commentsData] = await Promise.all([
          fetchStoryById(id),
          fetchComments(id)
        ]);
        setStory(storyData);
        setComments(commentsData);
      } catch (error) {
        console.error('Error loading story:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [id]);

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
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-50"
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
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-primary">
                    {comment.anonymous_author || (comment.profile as any)?.username || 'Anonym'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(comment.created_at).toLocaleDateString('de-DE')}
                  </span>
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
        onClose={() => setShowAuthModal(false)}
        onContinueAnonymous={() => handleSubmitComment(true)}
        title="Kommentieren"
      />
    </MainLayout>
  );
};

export default StoryPage;
