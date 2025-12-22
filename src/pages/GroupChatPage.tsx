import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { ChatMessage, ChatMessageData } from "@/components/shared/ChatMessage";
import { ChatMessageSkeleton } from "@/components/shared/SkeletonLoaders";
import { ReportModal } from "@/components/shared/ReportModal";
import { useToast } from "@/hooks/use-toast";
import { Send, ArrowLeft, Users, Lock, Mail } from "lucide-react";
import { fetchGroupMessages, sendGroupMessage, fetchChatGroups } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { AuthModal } from "@/components/auth/AuthModal";
import { generateNickname, useAnonymousId } from "@/hooks/useAnonymousId";
import { useAnonymousPreference } from "@/hooks/useAnonymousPreference";
import { supabase } from "@/integrations/supabase/client";
import type { ChatGroup } from "@/types/database";

interface ExtendedChatGroup extends ChatGroup {
  is_closed?: boolean;
  closed_reason?: string | null;
}

const GroupChatPage = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { user, isAdmin } = useAuth();
  const { anonymousId } = useAnonymousId();
  const { preferAnonymous, savePreference } = useAnonymousPreference();
  const [group, setGroup] = useState<ExtendedChatGroup | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [myNickname] = useState(generateNickname());
  const [onlineCount, setOnlineCount] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingMessage, setPendingMessage] = useState("");
  const [reportingMessageId, setReportingMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      try {
        const groups = await fetchChatGroups();
        const foundGroup = groups.find(g => g.id === id);
        setGroup(foundGroup || null);

        const messagesData = await fetchGroupMessages(id);
        const formattedMessages: ChatMessageData[] = messagesData.map((msg) => ({
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
        console.error('Error loading data:', error);
        toast({
          title: "Fehler",
          description: "Daten konnten nicht geladen werden.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();

    // Set up realtime subscription
    const channel = supabase
      .channel(`group-${id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'group_messages',
          filter: `group_id=eq.${id}`
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
  }, [id, user?.id, myNickname, anonymousId, toast]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !id) return;

    // If user has saved preference for anonymous, use it directly
    if (preferAnonymous === true) {
      await sendMessageToDatabase(newMessage, true);
      return;
    }

    if (!user) {
      setPendingMessage(newMessage);
      setShowAuthModal(true);
      return;
    }

    await sendMessageToDatabase(newMessage, false);
  };

  const sendMessageToDatabase = async (content: string, asAnonymous: boolean) => {
    if (!id) return;
    
    try {
      await sendGroupMessage({
        group_id: id,
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
      // Save preference for future messages
      savePreference(true);
      sendMessageToDatabase(pendingMessage, true);
    }
    setPendingMessage("");
  };

  const handleReport = (msgId: string) => {
    setReportingMessageId(msgId);
  };

  if (!group && !isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-muted-foreground">Gruppe nicht gefunden.</p>
          <Link to="/gruppen" className="text-primary hover:underline mt-4 inline-block">
            Zurück zu Gruppen
          </Link>
        </div>
      </MainLayout>
    );
  }

  // Show closed overlay if group is temporarily closed
  if (group?.is_closed && !isAdmin) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8 h-[calc(100vh-8rem)] flex items-center justify-center">
          <div className="glass-card p-8 max-w-md text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/20 flex items-center justify-center">
              <Lock className="w-8 h-8 text-destructive" />
            </div>
            <h2 className="font-display text-2xl font-bold mb-2">Vorübergehend geschlossen</h2>
            <p className="text-muted-foreground mb-4">
              Dieser Gruppenchat wurde vorübergehend durch einen Admin geschlossen.
            </p>
            {group.closed_reason && (
              <p className="text-sm bg-secondary p-3 rounded-lg mb-4">
                Grund: {group.closed_reason}
              </p>
            )}
            <div className="pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground mb-2">Fragen? Kontaktiere uns:</p>
              <a 
                href="mailto:Stade.news@web.de" 
                className="inline-flex items-center gap-2 text-primary hover:underline"
              >
                <Mail className="w-4 h-4" />
                Stade.news@web.de
              </a>
            </div>
            <Link to="/gruppen" className="btn-secondary mt-6 w-full">
              Zurück zu Gruppen
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-4 h-[calc(100vh-8rem)] md:h-[calc(100vh-6rem)] flex flex-col">
        {/* Header */}
        <div className="glass-card p-4 mb-4">
          <div className="flex items-center gap-4">
            <Link
              to="/gruppen"
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex-1">
              <h1 className="font-display text-lg font-bold">{group?.name || 'Laden...'}</h1>
              <p className="text-xs text-muted-foreground">Du bist: {myNickname}</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <Users className="w-4 h-4" />
              <span>{onlineCount > 0 ? onlineCount : 1}</span>
            </div>
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

      <ReportModal
        isOpen={!!reportingMessageId}
        onClose={() => setReportingMessageId(null)}
        contentType="group_message"
        contentId={reportingMessageId || ''}
      />
    </MainLayout>
  );
};

export default GroupChatPage;