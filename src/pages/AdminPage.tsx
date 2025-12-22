import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { 
  Check, 
  X, 
  Clock, 
  FileText, 
  MessageSquare, 
  AlertTriangle,
  Send,
  Loader2
} from "lucide-react";
import { 
  fetchAllStories, 
  updateStoryStatus, 
  createBreakingNews,
  fetchCategories
} from "@/lib/api";
import type { Story, Category } from "@/types/database";

const AdminPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"stories" | "eilmeldung">("stories");
  const [eilmeldung, setEilmeldung] = useState({ title: "", content: "", category_id: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate('/');
      return;
    }

    if (user && isAdmin) {
      loadData();
    }
  }, [user, isAdmin, authLoading, navigate]);

  const loadData = async () => {
    try {
      const [storiesData, categoriesData] = await Promise.all([
        fetchAllStories(),
        fetchCategories()
      ]);
      setStories(storiesData);
      setCategories(categoriesData);
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

  const handlePublish = async (id: string) => {
    try {
      await updateStoryStatus(id, 'published');
      setStories(stories.map(s => 
        s.id === id ? { ...s, status: 'published', published_at: new Date().toISOString() } : s
      ));
      toast({ title: "Story veröffentlicht!" });
    } catch (error) {
      console.error('Error publishing story:', error);
      toast({
        title: "Fehler",
        description: "Story konnte nicht veröffentlicht werden.",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (id: string) => {
    try {
      await updateStoryStatus(id, 'rejected');
      setStories(stories.map(s => 
        s.id === id ? { ...s, status: 'rejected' } : s
      ));
      toast({ title: "Story abgelehnt" });
    } catch (error) {
      console.error('Error rejecting story:', error);
      toast({
        title: "Fehler",
        description: "Story konnte nicht abgelehnt werden.",
        variant: "destructive",
      });
    }
  };

  const handleEilmeldung = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eilmeldung.title || !eilmeldung.content || !eilmeldung.category_id) {
      toast({
        title: "Fehler",
        description: "Bitte fülle alle Felder aus.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      await createBreakingNews({
        title: eilmeldung.title,
        content: eilmeldung.content,
        category_id: eilmeldung.category_id,
      });
      
      // Reload stories to show the new breaking news
      const updatedStories = await fetchAllStories();
      setStories(updatedStories);
      
      setEilmeldung({ title: "", content: "", category_id: "" });
      toast({ title: "Eilmeldung veröffentlicht!" });
    } catch (error) {
      console.error('Error creating breaking news:', error);
      toast({
        title: "Fehler",
        description: "Eilmeldung konnte nicht erstellt werden.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const pendingCount = stories.filter(s => s.status === 'pending').length;
  const publishedCount = stories.filter(s => s.status === 'published').length;

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `vor ${minutes} Min.`;
    if (hours < 24) return `vor ${hours} Std.`;
    return `vor ${days} Tagen`;
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

  if (!isAdmin) {
    return null;
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Verwalte Storys und erstelle Eilmeldungen</p>
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
              <Check className="w-6 h-6 mx-auto mb-2 text-success" />
              <p className="text-2xl font-bold">{publishedCount}</p>
              <p className="text-xs text-muted-foreground">Veröffentlicht</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto">
            {[
              { id: "stories", label: "Storys", icon: FileText },
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
                {tab.id === "stories" && pendingCount > 0 && (
                  <span className="ml-1 px-2 py-0.5 text-xs bg-warning/20 text-warning rounded-full">
                    {pendingCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Stories Tab */}
          {activeTab === "stories" && (
            <div className="space-y-4">
              {stories.length === 0 ? (
                <div className="glass-card p-8 text-center text-muted-foreground">
                  Keine Storys vorhanden.
                </div>
              ) : (
                stories.map((story) => (
                  <div key={story.id} className="glass-card p-4">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <span className="text-xs px-2 py-1 rounded-full bg-secondary inline-block mb-2">
                          {story.category?.icon} {story.category?.name || 'Unkategorisiert'}
                        </span>
                        {story.is_breaking && (
                          <span className="text-xs px-2 py-1 ml-2 rounded-full bg-destructive/20 text-destructive inline-block mb-2">
                            ⚡ Eilmeldung
                          </span>
                        )}
                        <h3 className="font-semibold">{story.title || 'Ohne Titel'}</h3>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ${
                        story.status === "pending" 
                          ? "bg-warning/20 text-warning"
                          : story.status === "published"
                          ? "bg-success/20 text-success"
                          : "bg-destructive/20 text-destructive"
                      }`}>
                        {story.status === "pending" ? "Offen" : story.status === "published" ? "Veröffentlicht" : "Abgelehnt"}
                      </span>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                      {story.content}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {formatTime(story.created_at)}
                        {story.anonymous_author && ` • von ${story.anonymous_author}`}
                      </span>
                      
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
                ))
              )}
            </div>
          )}

          {/* Eilmeldung Tab */}
          {activeTab === "eilmeldung" && (
            <form onSubmit={handleEilmeldung} className="glass-card p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Kategorie</label>
                <select
                  value={eilmeldung.category_id}
                  onChange={(e) => setEilmeldung({ ...eilmeldung, category_id: e.target.value })}
                  className="w-full px-4 py-3 bg-secondary border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">Kategorie wählen...</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

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
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-3 bg-destructive text-destructive-foreground rounded-xl font-medium hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
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