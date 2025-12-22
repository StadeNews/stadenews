import { useState, useEffect, useRef } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { ChatMessage, ChatMessageData } from "@/components/shared/ChatMessage";
import { ChatMessageSkeleton } from "@/components/shared/SkeletonLoaders";
import { useToast } from "@/hooks/use-toast";
import { Send, Users } from "lucide-react";

// Random nickname generator
const adjectives = ["Mysteriöser", "Anonymer", "Stille", "Nachtaktive", "Geheimer", "Unsichtbare", "Mutige", "Kluge"];
const nouns = ["Stader", "Vogel", "Schatten", "Beobachter", "Erzähler", "Wanderer", "Insider", "Geist"];

const generateNickname = () => {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 99) + 1;
  return `${adj}${noun}${num}`;
};

const initialMessages: ChatMessageData[] = [
  {
    id: "1",
    nickname: "MutigerInsider42",
    message: "Hat jemand gesehen was am Hafen los war?",
    timestamp: "14:23",
  },
  {
    id: "2",
    nickname: "StilleBeobachter7",
    message: "Ja, da war Polizei und Feuerwehr. Anscheinend ein Unfall.",
    timestamp: "14:25",
  },
  {
    id: "3",
    nickname: "AnonymerStader99",
    message: "Weiß jemand ob der Weihnachtsmarkt dieses Jahr wieder am Pferdemarkt ist?",
    timestamp: "14:28",
  },
  {
    id: "4",
    nickname: "GeheimeBotschafterin",
    message: "Ja, startet nächste Woche Montag! 🎄",
    timestamp: "14:30",
  },
];

const ChatPage = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [myNickname] = useState(generateNickname());
  const [onlineCount] = useState(Math.floor(Math.random() * 20) + 5);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMessages(initialMessages);
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;

    const message: ChatMessageData = {
      id: Date.now().toString(),
      nickname: myNickname,
      message: newMessage.trim(),
      timestamp: new Date().toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }),
      isOwn: true,
    };

    setMessages((prev) => [...prev, message]);
    setNewMessage("");
  };

  const handleReport = (id: string) => {
    toast({
      title: "Nachricht gemeldet",
      description: "Danke für dein Feedback. Wir prüfen die Nachricht.",
    });
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
            <span>{onlineCount} online</span>
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
    </MainLayout>
  );
};

export default ChatPage;
