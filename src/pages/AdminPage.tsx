import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  Check, 
  X, 
  Clock, 
  FileText, 
  AlertTriangle,
  Send,
  Loader2,
  Download,
  Edit2,
  Trash2,
  Users,
  MessageSquare,
  Flag,
  Instagram
} from "lucide-react";
import { 
  fetchAllStories, 
  updateStoryStatus, 
  createBreakingNews,
  fetchCategories,
  updateStory,
  deleteStory
} from "@/lib/api";
import type { Story, Category, Report, UserPresence } from "@/types/database";

const AdminPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<UserPresence[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"stories" | "eilmeldung" | "reports" | "users">("stories");
  const [eilmeldung, setEilmeldung] = useState({ title: "", content: "", category_id: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [editForm, setEditForm] = useState({ title: "", content: "" });
  
  // Rückfrage states
  const [askingStory, setAskingStory] = useState<Story | null>(null);
  const [questionMessage, setQuestionMessage] = useState("");
  const [isSendingQuestion, setIsSendingQuestion] = useState(false);

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

      // Fetch reports
      const { data: reportsData } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });
      setReports((reportsData || []) as unknown as Report[]);

      // Fetch online users
      const { data: presenceData } = await supabase
        .from('user_presence')
        .select('*')
        .eq('is_online', true);
      setOnlineUsers(presenceData || []);
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
      toast({ title: "Fehler", variant: "destructive" });
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
      toast({ title: "Fehler", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Story wirklich löschen?')) return;
    try {
      await deleteStory(id);
      setStories(stories.filter(s => s.id !== id));
      toast({ title: "Story gelöscht" });
    } catch (error) {
      console.error('Error deleting story:', error);
      toast({ title: "Fehler", variant: "destructive" });
    }
  };

  const handleEdit = (story: Story) => {
    setEditingStory(story);
    setEditForm({ title: story.title || '', content: story.content });
  };

  const handleSaveEdit = async () => {
    if (!editingStory) return;
    try {
      await updateStory(editingStory.id, editForm);
      setStories(stories.map(s => 
        s.id === editingStory.id ? { ...s, ...editForm } : s
      ));
      setEditingStory(null);
      toast({ title: "Story aktualisiert" });
    } catch (error) {
      console.error('Error updating story:', error);
      toast({ title: "Fehler", variant: "destructive" });
    }
  };

  const handleDownloadTxt = (story: Story) => {
    const content = `Titel: ${story.title || 'Ohne Titel'}\n\nKategorie: ${story.category?.name || 'Unkategorisiert'}\n\nInhalt:\n${story.content}\n\n---\nEingereicht: ${new Date(story.created_at).toLocaleString('de-DE')}\nVon: ${story.anonymous_author || 'Unbekannt'}\nSocial Media geeignet: ${story.social_media_suitable ? 'Ja' : 'Nein'}\nCredits: ${story.credits_name || 'Keine'}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `story-${story.id.slice(0, 8)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSendQuestion = async () => {
    if (!askingStory || !questionMessage.trim()) return;
    
    setIsSendingQuestion(true);
    try {
      await supabase.from('admin_messages').insert({
        story_id: askingStory.id,
        user_id: askingStory.user_id,
        anonymous_id: askingStory.anonymous_author,
        admin_message: questionMessage.trim(),
      });
      
      toast({ title: "Rückfrage gesendet!" });
      setAskingStory(null);
      setQuestionMessage("");
    } catch (error) {
      console.error('Error sending question:', error);
      toast({ title: "Fehler", variant: "destructive" });
    } finally {
      setIsSendingQuestion(false);
    }
  };

  const handleReportStatus = async (reportId: string, status: string) => {
    try {
      await supabase
        .from('reports')
        .update({ status })
        .eq('id', reportId);
      setReports(reports.map(r => r.id === reportId ? { ...r, status: status as Report['status'] } : r));
      toast({ title: "Status aktualisiert" });
    } catch (error) {
      console.error('Error updating report:', error);
      toast({ title: "Fehler", variant: "destructive" });
    }
  };

  const handleEilmeldung = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eilmeldung.title || !eilmeldung.content || !eilmeldung.category_id) {
      toast({ title: "Fehler", description: "Bitte fülle alle Felder aus.", variant: "destructive" });
      return;
    }
    
    setIsSubmitting(true);
    try {
      await createBreakingNews({
        title: eilmeldung.title,
        content: eilmeldung.content,
        category_id: eilmeldung.category_id,
      });
      const updatedStories = await fetchAllStories();
      setStories(updatedStories);
      setEilmeldung({ title: "", content: "", category_id: "" });
      toast({ title: "Eilmeldung veröffentlicht!" });
    } catch (error) {
      console.error('Error creating breaking news:', error);
      toast({ title: "Fehler", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const pendingCount = stories.filter(s => s.status === 'pending').length;
  const publishedCount = stories.filter(s => s.status === 'published').length;
  const pendingReports = reports.filter(r => r.status === 'pending').length;

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
      <MainLayout showFooter={false}>
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
    <MainLayout showFooter={false}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold mb-2 text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground">Verwalte Storys, Meldungen und Nutzer</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <FileText className="w-6 h-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold text-foreground">{stories.length}</p>
              <p className="text-xs text-muted-foreground">Storys</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <Clock className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
              <p className="text-2xl font-bold text-foreground">{pendingCount}</p>
              <p className="text-xs text-muted-foreground">Offen</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <Flag className="w-6 h-6 mx-auto mb-2 text-destructive" />
              <p className="text-2xl font-bold text-foreground">{pendingReports}</p>
              <p className="text-xs text-muted-foreground">Meldungen</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <Users className="w-6 h-6 mx-auto mb-2 text-green-500" />
              <p className="text-2xl font-bold text-foreground">{onlineUsers.length}</p>
              <p className="text-xs text-muted-foreground">Online</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto">
            {[
              { id: "stories", label: "Storys", icon: FileText, badge: pendingCount },
              { id: "eilmeldung", label: "Eilmeldung", icon: AlertTriangle },
              { id: "reports", label: "Meldungen", icon: Flag, badge: pendingReports },
              { id: "users", label: "Nutzer", icon: Users, badge: onlineUsers.length },
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
                {tab.badge && tab.badge > 0 && (
                  <span className="ml-1 px-2 py-0.5 text-xs bg-yellow-500/20 text-yellow-600 rounded-full">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Stories Tab */}
          {activeTab === "stories" && (
            <div className="space-y-4">
              {/* Edit Modal */}
              {editingStory && (
                <div className="bg-card border-2 border-primary rounded-xl p-4">
                  <h3 className="font-semibold mb-3 text-foreground">Story bearbeiten</h3>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    placeholder="Titel"
                    className="w-full mb-2 px-3 py-2 bg-secondary border border-border rounded-lg text-foreground"
                  />
                  <textarea
                    value={editForm.content}
                    onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                    rows={4}
                    className="w-full mb-3 px-3 py-2 bg-secondary border border-border rounded-lg resize-none text-foreground"
                  />
                  <div className="flex gap-2">
                    <button onClick={handleSaveEdit} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg">
                      Speichern
                    </button>
                    <button onClick={() => setEditingStory(null)} className="px-4 py-2 bg-secondary text-foreground rounded-lg">
                      Abbrechen
                    </button>
                  </div>
                </div>
              )}

              {/* Question Modal */}
              {askingStory && (
                <div className="bg-card border-2 border-blue-500 rounded-xl p-4">
                  <h3 className="font-semibold mb-3 text-foreground flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-500" />
                    Rückfrage an Verfasser
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Story: {askingStory.title || askingStory.content.slice(0, 50) + '...'}
                  </p>
                  <textarea
                    value={questionMessage}
                    onChange={(e) => setQuestionMessage(e.target.value)}
                    placeholder="Deine Rückfrage an den Verfasser..."
                    rows={3}
                    className="w-full mb-3 px-3 py-2 bg-secondary border border-border rounded-lg resize-none text-foreground"
                  />
                  <div className="flex gap-2">
                    <button 
                      onClick={handleSendQuestion} 
                      disabled={isSendingQuestion || !questionMessage.trim()}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
                    >
                      {isSendingQuestion ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      Senden
                    </button>
                    <button onClick={() => { setAskingStory(null); setQuestionMessage(""); }} className="px-4 py-2 bg-secondary text-foreground rounded-lg">
                      Abbrechen
                    </button>
                  </div>
                </div>
              )}

              {stories.length === 0 ? (
                <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground">
                  Keine Storys vorhanden.
                </div>
              ) : (
                stories.map((story) => (
                  <div key={story.id} className="bg-card border border-border rounded-xl p-4">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <div className="flex flex-wrap gap-2 mb-2">
                          <span className="text-xs px-2 py-1 rounded-full bg-secondary text-foreground">
                            {story.category?.icon} {story.category?.name || 'Unkategorisiert'}
                          </span>
                          {story.is_breaking && (
                            <span className="text-xs px-2 py-1 rounded-full bg-destructive/20 text-destructive">
                              ⚡ Eilmeldung
                            </span>
                          )}
                          {story.social_media_suitable && (
                            <span className="text-xs px-2 py-1 rounded-full bg-pink-500/20 text-pink-600 flex items-center gap-1">
                              <Instagram className="w-3 h-3" /> Social Media
                            </span>
                          )}
                        </div>
                        <h3 className="font-semibold text-foreground">{story.title || 'Ohne Titel'}</h3>
                        {story.credits_name && (
                          <p className="text-xs text-primary mt-1">Credits: {story.credits_name}</p>
                        )}
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ${
                        story.status === "pending" 
                          ? "bg-yellow-500/20 text-yellow-600"
                          : story.status === "published"
                          ? "bg-green-500/20 text-green-600"
                          : "bg-destructive/20 text-destructive"
                      }`}>
                        {story.status === "pending" ? "Offen" : story.status === "published" ? "Veröffentlicht" : "Abgelehnt"}
                      </span>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                      {story.content}
                    </p>
                    
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="text-xs text-muted-foreground">
                        {formatTime(story.created_at)}
                        {story.anonymous_author && ` • von ${story.anonymous_author}`}
                      </span>
                      
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => handleDownloadTxt(story)}
                          className="flex items-center gap-1 px-2 py-1 bg-secondary text-foreground rounded text-xs hover:bg-secondary/80"
                          title="Als TXT herunterladen"
                        >
                          <Download className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => setAskingStory(story)}
                          className="flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-600 rounded text-xs hover:bg-blue-500/30"
                          title="Rückfrage stellen"
                        >
                          <MessageSquare className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleEdit(story)}
                          className="flex items-center gap-1 px-2 py-1 bg-secondary text-foreground rounded text-xs hover:bg-secondary/80"
                          title="Bearbeiten"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDelete(story.id)}
                          className="flex items-center gap-1 px-2 py-1 bg-destructive/20 text-destructive rounded text-xs hover:bg-destructive/30"
                          title="Löschen"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                        {story.status === "pending" && (
                          <>
                            <button
                              onClick={() => handlePublish(story.id)}
                              className="flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-600 rounded text-xs hover:bg-green-500/30"
                            >
                              <Check className="w-3 h-3" /> OK
                            </button>
                            <button
                              onClick={() => handleReject(story.id)}
                              className="flex items-center gap-1 px-2 py-1 bg-destructive/20 text-destructive rounded text-xs hover:bg-destructive/30"
                            >
                              <X className="w-3 h-3" /> Nein
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Eilmeldung Tab */}
          {activeTab === "eilmeldung" && (
            <form onSubmit={handleEilmeldung} className="bg-card border border-border rounded-xl p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Kategorie</label>
                <select
                  value={eilmeldung.category_id}
                  onChange={(e) => setEilmeldung({ ...eilmeldung, category_id: e.target.value })}
                  className="w-full px-4 py-3 bg-secondary border border-border rounded-xl text-foreground"
                >
                  <option value="">Kategorie wählen...</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Titel</label>
                <input
                  type="text"
                  value={eilmeldung.title}
                  onChange={(e) => setEilmeldung({ ...eilmeldung, title: e.target.value })}
                  placeholder="Eilmeldung Titel..."
                  className="w-full px-4 py-3 bg-secondary border border-border rounded-xl text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Inhalt</label>
                <textarea
                  value={eilmeldung.content}
                  onChange={(e) => setEilmeldung({ ...eilmeldung, content: e.target.value })}
                  placeholder="Eilmeldung Text..."
                  rows={4}
                  className="w-full px-4 py-3 bg-secondary border border-border rounded-xl resize-none text-foreground"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-3 bg-destructive text-destructive-foreground rounded-xl font-medium disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                Eilmeldung veröffentlichen
              </button>
            </form>
          )}

          {/* Reports Tab */}
          {activeTab === "reports" && (
            <div className="space-y-4">
              {reports.length === 0 ? (
                <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground">
                  Keine Meldungen vorhanden.
                </div>
              ) : (
                reports.map((report) => (
                  <div key={report.id} className="bg-card border border-border rounded-xl p-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <span className="text-xs px-2 py-1 bg-secondary rounded-full text-foreground">
                          {report.content_type}
                        </span>
                        <p className="font-medium mt-2 text-foreground">{report.reason}</p>
                        {report.details && (
                          <p className="text-sm text-muted-foreground mt-1">{report.details}</p>
                        )}
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        report.status === 'pending' ? 'bg-yellow-500/20 text-yellow-600' :
                        report.status === 'resolved' ? 'bg-green-500/20 text-green-600' :
                        'bg-secondary text-muted-foreground'
                      }`}>
                        {report.status}
                      </span>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleReportStatus(report.id, 'resolved')}
                        className="text-xs px-3 py-1 bg-green-500/20 text-green-600 rounded hover:bg-green-500/30"
                      >
                        Erledigt
                      </button>
                      <button
                        onClick={() => handleReportStatus(report.id, 'dismissed')}
                        className="text-xs px-3 py-1 bg-secondary text-foreground rounded hover:bg-secondary/80"
                      >
                        Ablehnen
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Users Tab */}
          {activeTab === "users" && (
            <div className="space-y-4">
              <div className="bg-card border border-border rounded-xl p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2 text-foreground">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  Online Nutzer ({onlineUsers.length})
                </h3>
                {onlineUsers.length === 0 ? (
                  <p className="text-muted-foreground text-sm">Keine Nutzer online.</p>
                ) : (
                  <div className="space-y-2">
                    {onlineUsers.map((presence) => (
                      <div key={presence.id} className="flex items-center gap-3 p-2 bg-secondary rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                          <Users className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">
                            {presence.user_id ? `User ${presence.user_id.slice(0, 8)}...` : `Anonym ${presence.anonymous_id?.slice(0, 8)}...`}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Aktiv: {formatTime(presence.last_seen)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminPage;