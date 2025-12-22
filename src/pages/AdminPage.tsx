import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useToast } from "@/hooks/use-toast";
import { 
  Eye, 
  Check, 
  X, 
  Clock, 
  FileText, 
  MessageSquare, 
  Users, 
  AlertTriangle,
  Send,
  Trash2,
  Ban
} from "lucide-react";

// Types
interface Story {
  id: string;
  category: string;
  title: string;
  content: string;
  status: "pending" | "published" | "rejected";
  submittedAt: string;
}

interface ChatUser {
  id: string;
  nickname: string;
  messageCount: number;
  isBanned: boolean;
}

// Mock data
const mockStories: Story[] = [
  {
    id: "1",
    category: "🚨 Blaulicht",
    title: "Unfall auf der B73",
    content: "Heute morgen gab es einen schweren Auffahrunfall auf der B73 Höhe Abfahrt Stade-Nord...",
    status: "pending",
    submittedAt: "vor 30 Min.",
  },
  {
    id: "2",
    category: "🗣 Gossip",
    title: "Neues Café eröffnet",
    content: "In der Hökerstraße macht ein neues Café auf. Die Inhaber sind aus Hamburg...",
    status: "pending",
    submittedAt: "vor 1 Std.",
  },
  {
    id: "3",
    category: "⚠️ Aufreger",
    title: "Parkplatzsituation",
    content: "Die Parkplatzsituation in der Innenstadt wird immer schlimmer...",
    status: "published",
    submittedAt: "vor 3 Std.",
  },
];

const mockChatUsers: ChatUser[] = [
  { id: "1", nickname: "MutigerInsider42", messageCount: 15, isBanned: false },
  { id: "2", nickname: "StilleBeobachter7", messageCount: 8, isBanned: false },
  { id: "3", nickname: "TrollMaster99", messageCount: 23, isBanned: true },
];

const AdminPage = () => {
  const { toast } = useToast();
  const [stories, setStories] = useState<Story[]>(mockStories);
  const [chatUsers, setChatUsers] = useState<ChatUser[]>(mockChatUsers);
  const [activeTab, setActiveTab] = useState<"stories" | "chat" | "eilmeldung">("stories");
  
  // Eilmeldung form
  const [eilmeldung, setEilmeldung] = useState({ title: "", content: "" });

  const handlePublish = (id: string) => {
    setStories(stories.map(s => 
      s.id === id ? { ...s, status: "published" as const } : s
    ));
    toast({ title: "Story veröffentlicht!" });
  };

  const handleReject = (id: string) => {
    setStories(stories.map(s => 
      s.id === id ? { ...s, status: "rejected" as const } : s
    ));
    toast({ title: "Story abgelehnt" });
  };

  const handleBanUser = (id: string) => {
    setChatUsers(chatUsers.map(u => 
      u.id === id ? { ...u, isBanned: !u.isBanned } : u
    ));
    toast({ title: "Nutzer-Status geändert" });
  };

  const handleEilmeldung = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eilmeldung.title || !eilmeldung.content) return;
    
    const newStory: Story = {
      id: Date.now().toString(),
      category: "⚡ Eilmeldung",
      title: eilmeldung.title,
      content: eilmeldung.content,
      status: "published",
      submittedAt: "gerade eben",
    };
    
    setStories([newStory, ...stories]);
    setEilmeldung({ title: "", content: "" });
    toast({ title: "Eilmeldung veröffentlicht!" });
  };

  const pendingCount = stories.filter(s => s.status === "pending").length;

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Verwalte Storys und moderiere den Chat</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="glass-card p-4 text-center">
              <FileText className="w-6 h-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{stories.length}</p>
              <p className="text-xs text-muted-foreground">Gesamt</p>
            </div>
            <div className="glass-card p-4 text-center">
              <Clock className="w-6 h-6 mx-auto mb-2 text-warning" />
              <p className="text-2xl font-bold">{pendingCount}</p>
              <p className="text-xs text-muted-foreground">Offen</p>
            </div>
            <div className="glass-card p-4 text-center">
              <Users className="w-6 h-6 mx-auto mb-2 text-success" />
              <p className="text-2xl font-bold">{chatUsers.length}</p>
              <p className="text-xs text-muted-foreground">Chat-User</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto">
            {[
              { id: "stories", label: "Storys", icon: FileText },
              { id: "chat", label: "Chat-Moderation", icon: MessageSquare },
              { id: "eilmeldung", label: "Eilmeldung", icon: AlertTriangle },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Stories Tab */}
          {activeTab === "stories" && (
            <div className="space-y-4">
              {stories.map((story) => (
                <div key={story.id} className="glass-card p-4">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <span className="text-xs px-2 py-1 rounded-full bg-secondary inline-block mb-2">
                        {story.category}
                      </span>
                      <h3 className="font-semibold">{story.title}</h3>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      story.status === "pending" 
                        ? "bg-warning/20 text-warning"
                        : story.status === "published"
                        ? "bg-success/20 text-success"
                        : "bg-destructive/20 text-destructive"
                    }`}>
                      {story.status === "pending" ? "Offen" : story.status === "published" ? "Veröffentlicht" : "Abgelehnt"}
                    </span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {story.content}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{story.submittedAt}</span>
                    
                    {story.status === "pending" && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handlePublish(story.id)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-success/20 text-success rounded-lg text-sm hover:bg-success/30 transition-colors"
                        >
                          <Check className="w-4 h-4" />
                          Veröffentlichen
                        </button>
                        <button
                          onClick={() => handleReject(story.id)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-destructive/20 text-destructive rounded-lg text-sm hover:bg-destructive/30 transition-colors"
                        >
                          <X className="w-4 h-4" />
                          Ablehnen
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Chat Tab */}
          {activeTab === "chat" && (
            <div className="space-y-4">
              {chatUsers.map((user) => (
                <div key={user.id} className="glass-card p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      {user.nickname.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">{user.nickname}</p>
                      <p className="text-xs text-muted-foreground">{user.messageCount} Nachrichten</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleBanUser(user.id)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        user.isBanned
                          ? "bg-success/20 text-success hover:bg-success/30"
                          : "bg-destructive/20 text-destructive hover:bg-destructive/30"
                      }`}
                    >
                      <Ban className="w-4 h-4" />
                      {user.isBanned ? "Entsperren" : "Sperren"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Eilmeldung Tab */}
          {activeTab === "eilmeldung" && (
            <form onSubmit={handleEilmeldung} className="glass-card p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Titel</label>
                <input
                  type="text"
                  value={eilmeldung.title}
                  onChange={(e) => setEilmeldung({ ...eilmeldung, title: e.target.value })}
                  placeholder="Eilmeldung Titel..."
                  className="w-full px-4 py-3 bg-secondary border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Inhalt</label>
                <textarea
                  value={eilmeldung.content}
                  onChange={(e) => setEilmeldung({ ...eilmeldung, content: e.target.value })}
                  placeholder="Eilmeldung Text..."
                  rows={4}
                  className="w-full px-4 py-3 bg-secondary border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                />
              </div>
              
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-3 bg-destructive text-destructive-foreground rounded-xl font-medium hover:opacity-90 transition-all"
              >
                <Send className="w-5 h-5" />
                Eilmeldung veröffentlichen
              </button>
            </form>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminPage;
