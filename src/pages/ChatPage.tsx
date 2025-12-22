import { useState, useEffect, useRef } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { ChatMessage, ChatMessageData } from "@/components/shared/ChatMessage";
import { ChatMessageSkeleton } from "@/components/shared/SkeletonLoaders";
import { useToast } from "@/hooks/use-toast";
import { Send, Users } from "lucide-react";
import { fetchChatMessages, sendChatMessage, deleteChatMessage } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { AuthModal } from "@/components/auth/AuthModal";
import { generateNickname, useAnonymousId } from "@/hooks/useAnonymousId";
import { supabase } from "@/integrations/supabase/client";

const ChatPage = () => {
  const { toast } = useToast();
  const { user, isAdmin } = useAuth();
  const { anonymousId } = useAnonymousId();
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [myNickname] = useState(generateNickname());
  const [onlineCount, setOnlineCount] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingMessage, setPendingMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load messages and set up realtime subscription
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const data = await fetchChatMessages();
        const formattedMessages: ChatMessageData[] = data.map((msg) => ({
          id: msg.id,
          nickname: msg.nickname,
          message: msg.content,
          timestamp: new Date(msg.created_at).toLocaleTimeString("de-DE", { 
            hour: "2-digit", 
            minute: "2-digit" 
          }),
          isOwn: msg.user_id === user?.id || (msg.is_anonymous && msg.nickname === myNickname),
        }));
        setMessages(formattedMessages);
      } catch (error) {
        console.error('Error loading messages:', error);
        toast({
          title: "Fehler",
          description: "Nachrichten konnten nicht geladen werden.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();

    // Set up realtime subscription
    const channel = supabase
      .channel('chat-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages'
        },
        (payload) => {
          const newMsg = payload.new as {
            id: string;
            nickname: string;
            content: string;
            created_at: string;
            user_id: string | null;
            is_anonymous: boolean;
          };
          
          const formattedMsg: ChatMessageData = {
            id: newMsg.id,
            nickname: newMsg.nickname,
            message: newMsg.content,
            timestamp: new Date(newMsg.created_at).toLocaleTimeString("de-DE", { 
              hour: "2-digit", 
              minute: "2-digit" 
            }),
            isOwn: newMsg.user_id === user?.id || (newMsg.is_anonymous && newMsg.nickname === myNickname),
          };
          
          setMessages((prev) => [...prev, formattedMsg]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_messages'
        },
        (payload) => {
          const updatedMsg = payload.new as { id: string; is_deleted: boolean };
          if (updatedMsg.is_deleted) {
            setMessages((prev) => prev.filter((msg) => msg.id !== updatedMsg.id));
          }
        }
      )
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        setOnlineCount(Object.keys(state).length);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ user_id: user?.id || anonymousId });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, myNickname, anonymousId, toast]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;

    // If not logged in, show auth modal
    if (!user) {
      setPendingMessage(newMessage);
      setShowAuthModal(true);
      return;
    }

    await sendMessageToDatabase(newMessage, false);
  };

  const sendMessageToDatabase = async (content: string, asAnonymous: boolean) => {
    try {
      await sendChatMessage({
        content: content.trim(),
        nickname: myNickname,
        user_id: asAnonymous ? undefined : user?.id,
        is_anonymous: asAnonymous || !user,
      });
      setNewMessage("");
      setPendingMessage("");
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Fehler",
        description: "Nachricht konnte nicht gesendet werden.",
        variant: "destructive",
      });
    }
  };

  const handleAuthModalClose = (action?: 'login' | 'anonymous') => {
    setShowAuthModal(false);
    if (action === 'anonymous' && pendingMessage) {
      sendMessageToDatabase(pendingMessage, true);
    }
    setPendingMessage("");
  };

  const handleReport = (id: string) => {
    toast({
      title: "Nachricht gemeldet",
      description: "Danke für dein Feedback. Wir prüfen die Nachricht.",
    });
  };

  const handleDelete = async (id: string) => {
    if (!isAdmin) return;
    
    try {
      await deleteChatMessage(id);
      toast({
        title: "Nachricht gelöscht",
        description: "Die Nachricht wurde entfernt.",
      });
    } catch (error) {
      console.error('Error deleting message:', error);
      toast({
        title: "Fehler",
        description: "Nachricht konnte nicht gelöscht werden.",
        variant: "destructive",
      });
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-4 h-[calc(100vh-8rem)] md:h-[calc(100vh-6rem)] flex flex-col">
        {/* Header */}
        <div className="glass-card p-4 mb-4 flex items-center justify-between">
          <div>
            <h1 className="font-display text-xl font-bold">Community Chat</h1>
            <p className="text-xs text-muted-foreground">Du bist: {myNickname}</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <Users className="w-4 h-4" />
            <span>{onlineCount > 0 ? onlineCount : 1} online</span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 glass-card p-4 overflow-y-auto space-y-4 mb-4">
          {isLoading ? (
            <>
              <ChatMessageSkeleton />
              <ChatMessageSkeleton />
              <ChatMessageSkeleton />
            </>
          ) : messages.length > 0 ? (
            messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                message={msg}
                onReport={handleReport}
              />
            ))
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              Sei der Erste der etwas schreibt!
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="glass-card p-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Schreibe eine Nachricht..."
              maxLength={500}
              className="flex-1 px-4 py-3 bg-secondary border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="px-4 py-3 bg-primary text-primary-foreground rounded-xl hover:neon-glow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => handleAuthModalClose()}
        onContinueAnonymous={() => handleAuthModalClose('anonymous')}
        showAnonymousOption={true}
      />
    </MainLayout>
  );
};

export default ChatPage;