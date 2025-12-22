import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useAuth } from "@/hooks/useAuth";
import { fetchUserStories } from "@/lib/api";
import { Link, useNavigate } from "react-router-dom";
import { Clock, Check, X, Eye, Send, MessageSquare, Reply } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Story } from "@/types/database";

interface AdminMessage {
  id: string;
  story_id: string | null;
  admin_message: string;
  user_reply: string | null;
  is_read: boolean | null;
  created_at: string;
}

const MeineEinsendungenPage = () => {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stories, setStories] = useState<Story[]>([]);
  const [adminMessages, setAdminMessages] = useState<AdminMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }

    if (user) {
      Promise.all([
        fetchUserStories(user.id),
        supabase
          .from('admin_messages')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
      ])
        .then(([storiesData, messagesResult]) => {
          setStories(storiesData);
          if (!messagesResult.error) {
            setAdminMessages(messagesResult.data as AdminMessage[]);
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user, authLoading, navigate]);

  const handleReply = async (messageId: string) => {
    if (!replyText.trim()) return;
    
    setSubmittingReply(true);
    try {
      const { error } = await supabase
        .from('admin_messages')
        .update({ user_reply: replyText.trim(), is_read: true })
        .eq('id', messageId);

      if (error) throw error;

      setAdminMessages(msgs => 
        msgs.map(m => m.id === messageId ? { ...m, user_reply: replyText.trim(), is_read: true } : m)
      );
      setReplyText("");
      setReplyingTo(null);
      toast({ title: "Antwort gesendet" });
    } catch (error) {
      console.error('Error sending reply:', error);
      toast({ title: "Fehler", description: "Antwort konnte nicht gesendet werden.", variant: "destructive" });
    } finally {
      setSubmittingReply(false);
    }
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'published':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/20 text-green-600 text-xs font-medium">
            <Check className="w-3 h-3" />
            Veröffentlicht
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-destructive/20 text-destructive text-xs font-medium">
            <X className="w-3 h-3" />
            Abgelehnt
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/20 text-amber-600 text-xs font-medium">
            <Clock className="w-3 h-3" />
            In Prüfung
          </span>
        );
    }
  };

  const getMessagesForStory = (storyId: string) => {
    return adminMessages.filter(m => m.story_id === storyId);
  };

  if (authLoading || loading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-4 h-24" />
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

  const unreadCount = adminMessages.filter(m => !m.is_read).length;

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h1 className="font-display text-2xl font-bold text-foreground">Meine Einsendungen</h1>
              {unreadCount > 0 && (
                <span className="px-2 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                  {unreadCount} neue Nachricht{unreadCount > 1 ? 'en' : ''}
                </span>
              )}
            </div>
            <Link
              to="/senden"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Send className="w-4 h-4" />
              Neue Story
            </Link>
          </div>

          {stories.length === 0 ? (
            <div className="text-center py-12 bg-card border border-border rounded-xl">
              <Send className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-foreground mb-2">Noch keine Einsendungen</h2>
              <p className="text-muted-foreground mb-4">Du hast noch keine Stories eingereicht.</p>
              <Link
                to="/senden"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                <Send className="w-4 h-4" />
                Jetzt Story senden
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {stories.map((story) => {
                const storyMessages = getMessagesForStory(story.id);
                const hasUnread = storyMessages.some(m => !m.is_read);
                
                return (
                  <div
                    key={story.id}
                    className={`bg-card border rounded-xl p-4 transition-colors ${
                      hasUnread ? 'border-primary' : 'border-border hover:border-primary/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusBadge(story.status)}
                          {story.category && (
                            <span className="text-xs text-muted-foreground">
                              {story.category.icon} {story.category.name}
                            </span>
                          )}
                          {storyMessages.length > 0 && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium">
                              <MessageSquare className="w-3 h-3" />
                              {storyMessages.length}
                            </span>
                          )}
                        </div>
                        <h3 className="font-semibold text-foreground truncate">
                          {story.title || 'Ohne Titel'}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {story.content}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(story.created_at).toLocaleDateString('de-DE', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      {story.status === 'published' && (
                        <Link
                          to={`/story/${story.id}`}
                          className="flex items-center gap-1 px-3 py-1.5 bg-secondary text-foreground rounded-lg text-sm hover:bg-secondary/80 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          Ansehen
                        </Link>
                      )}
                    </div>

                    {/* Admin Messages Section */}
                    {storyMessages.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-border space-y-3">
                        <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-primary" />
                          Nachrichten vom Team
                        </h4>
                        {storyMessages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`p-3 rounded-lg ${
                              !msg.is_read ? 'bg-primary/10 border border-primary/30' : 'bg-secondary'
                            }`}
                          >
                            <p className="text-sm text-foreground">{msg.admin_message}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(msg.created_at).toLocaleDateString('de-DE', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                            
                            {msg.user_reply ? (
                              <div className="mt-2 p-2 bg-card rounded border border-border">
                                <p className="text-xs text-muted-foreground mb-1">Deine Antwort:</p>
                                <p className="text-sm text-foreground">{msg.user_reply}</p>
                              </div>
                            ) : (
                              <>
                                {replyingTo === msg.id ? (
                                  <div className="mt-2 space-y-2">
                                    <textarea
                                      value={replyText}
                                      onChange={(e) => setReplyText(e.target.value)}
                                      placeholder="Deine Antwort..."
                                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                                      rows={2}
                                    />
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => handleReply(msg.id)}
                                        disabled={submittingReply || !replyText.trim()}
                                        className="px-3 py-1.5 bg-primary text-primary-foreground rounded text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
                                      >
                                        {submittingReply ? "..." : "Senden"}
                                      </button>
                                      <button
                                        onClick={() => { setReplyingTo(null); setReplyText(""); }}
                                        className="px-3 py-1.5 bg-secondary text-foreground rounded text-sm hover:bg-secondary/80"
                                      >
                                        Abbrechen
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setReplyingTo(msg.id)}
                                    className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                                  >
                                    <Reply className="w-3 h-3" />
                                    Antworten
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default MeineEinsendungenPage;
