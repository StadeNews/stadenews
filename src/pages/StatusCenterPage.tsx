import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Footer } from "@/components/shared/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useAnonymousId } from "@/hooks/useAnonymousId";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Inbox, 
  Clock, 
  Check, 
  X, 
  MessageSquare,
  Loader2,
  Send,
  FileText
} from "lucide-react";

interface AdminMessage {
  id: string;
  story_id: string | null;
  admin_message: string;
  user_reply: string | null;
  is_read: boolean;
  created_at: string;
}

interface UserStory {
  id: string;
  title: string | null;
  content: string;
  status: string;
  created_at: string;
}

const StatusCenterPage = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { anonymousId } = useAnonymousId();
  const { toast } = useToast();
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [stories, setStories] = useState<UserStory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'status' | 'messages'>('status');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    if (!authLoading) {
      if (!user && !anonymousId) {
        navigate('/');
        return;
      }
      loadData();
    }
  }, [user, anonymousId, authLoading, navigate]);

  const loadData = async () => {
    try {
      // Fetch user's stories
      if (user) {
        const { data: storiesData } = await supabase
          .from('stories')
          .select('id, title, content, status, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        setStories(storiesData || []);
      }

      // Fetch admin messages
      const { data: messagesData } = await supabase
        .from('admin_messages')
        .select('*')
        .or(user ? `user_id.eq.${user.id}` : `anonymous_id.eq.${anonymousId}`)
        .order('created_at', { ascending: false });
      
      setMessages(messagesData || []);

      // Mark messages as read
      if (messagesData && messagesData.length > 0) {
        await supabase
          .from('admin_messages')
          .update({ is_read: true })
          .or(user ? `user_id.eq.${user.id}` : `anonymous_id.eq.${anonymousId}`)
          .eq('is_read', false);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReply = async (messageId: string) => {
    if (!replyText.trim()) return;

    try {
      await supabase
        .from('admin_messages')
        .update({ user_reply: replyText })
        .eq('id', messageId);

      setMessages(messages.map(m => 
        m.id === messageId ? { ...m, user_reply: replyText } : m
      ));
      setReplyTo(null);
      setReplyText('');
      toast({ title: "Antwort gesendet" });
    } catch (error) {
      console.error('Error sending reply:', error);
      toast({ title: "Fehler", variant: "destructive" });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-warning" />;
      case 'published': return <Check className="w-4 h-4 text-success" />;
      case 'rejected': return <X className="w-4 h-4 text-destructive" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'In Prüfung';
      case 'published': return 'Veröffentlicht';
      case 'rejected': return 'Abgelehnt';
      default: return status;
    }
  };

  if (authLoading || isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  const unreadCount = messages.filter(m => !m.is_read && !m.user_reply).length;

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="font-display text-3xl font-bold mb-6">Status-Center</h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('status')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'status'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground hover:text-foreground'
            }`}
          >
            <FileText className="w-4 h-4" />
            Meine Meldungen
            {stories.filter(s => s.status === 'pending').length > 0 && (
              <span className="px-2 py-0.5 text-xs bg-warning/20 text-warning rounded-full">
                {stories.filter(s => s.status === 'pending').length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'messages'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground hover:text-foreground'
            }`}
          >
            <Inbox className="w-4 h-4" />
            Nachrichten
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 text-xs bg-destructive text-destructive-foreground rounded-full">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Status Tab */}
        {activeTab === 'status' && (
          <div className="space-y-3">
            {stories.length === 0 ? (
              <div className="glass-card p-8 text-center text-muted-foreground">
                Du hast noch keine Meldungen eingereicht.
              </div>
            ) : (
              stories.map((story) => (
                <div key={story.id} className="glass-card p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold line-clamp-1">
                        {story.title || 'Ohne Titel'}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {story.content}
                      </p>
                    </div>
                    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
                      story.status === 'pending' ? 'bg-warning/20 text-warning' :
                      story.status === 'published' ? 'bg-success/20 text-success' :
                      'bg-destructive/20 text-destructive'
                    }`}>
                      {getStatusIcon(story.status)}
                      {getStatusText(story.status)}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(story.created_at).toLocaleDateString('de-DE')}
                  </p>
                </div>
              ))
            )}
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div className="space-y-3">
            {messages.length === 0 ? (
              <div className="glass-card p-8 text-center text-muted-foreground">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Keine Nachrichten vorhanden.</p>
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className="glass-card p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground mb-1">
                        Admin • {new Date(message.created_at).toLocaleDateString('de-DE')}
                      </p>
                      <p className="text-sm">{message.admin_message}</p>
                    </div>
                  </div>

                  {message.user_reply ? (
                    <div className="ml-11 p-3 bg-secondary rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Deine Antwort:</p>
                      <p className="text-sm">{message.user_reply}</p>
                    </div>
                  ) : replyTo === message.id ? (
                    <div className="ml-11 flex gap-2">
                      <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Deine Antwort..."
                        className="flex-1 px-3 py-2 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                        autoFocus
                      />
                      <button
                        onClick={() => handleReply(message.id)}
                        className="p-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => { setReplyTo(null); setReplyText(''); }}
                        className="p-2 bg-secondary rounded-lg hover:bg-secondary/80"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setReplyTo(message.id)}
                      className="ml-11 text-sm text-primary hover:underline"
                    >
                      Antworten
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
      <Footer />
    </MainLayout>
  );
};

export default StatusCenterPage;
