import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
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
  Instagram,
  Ban,
  Lock,
  Unlock,
  MessageCircle,
  Image,
  Video,
  ShieldAlert,
  ShieldCheck,
  Crown,
  UserCheck,
  UserX,
  BarChart3
} from "lucide-react";
import { 
  fetchAllStories, 
  updateStoryStatus, 
  createBreakingNews,
  fetchCategories,
  updateStory,
  deleteStory,
  fetchChatGroups,
  deleteChatGroup,
  fetchGroupMessages,
  deleteGroupMessage,
  markStoryUnverified
} from "@/lib/api";
import type { Story, Category, Report, UserPresence, ChatGroup, GroupMessage } from "@/types/database";

interface BannedUser {
  id: string;
  user_id: string | null;
  anonymous_id: string | null;
  reason: string;
  banned_by: string;
  banned_until: string | null;
  created_at: string;
}

interface ExtendedChatGroup extends ChatGroup {
  is_closed?: boolean;
  closed_reason?: string | null;
}

interface AdminUser {
  id: string;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  is_private: boolean;
  is_online: boolean;
  created_at: string;
  updated_at: string;
  role: string;
}

const AdminPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<UserPresence[]>([]);
  const [bannedUsers, setBannedUsers] = useState<BannedUser[]>([]);
  const [chatGroups, setChatGroups] = useState<ExtendedChatGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"stories" | "eilmeldung" | "reports" | "users" | "groups" | "accounts">("stories");
  const [allUsers, setAllUsers] = useState<AdminUser[]>([]);
  const [eilmeldung, setEilmeldung] = useState({ title: "", content: "", category_id: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [editForm, setEditForm] = useState({ title: "", content: "" });
  
  // Rückfrage states
  const [askingStory, setAskingStory] = useState<Story | null>(null);
  const [questionMessage, setQuestionMessage] = useState("");
  const [isSendingQuestion, setIsSendingQuestion] = useState(false);

  // Ban modal state
  const [banningId, setBanningId] = useState<{ type: 'user' | 'anonymous', id: string } | null>(null);
  const [banReason, setBanReason] = useState("");

  // Close group modal
  const [closingGroupId, setClosingGroupId] = useState<string | null>(null);
  const [closeReason, setCloseReason] = useState("");

  // Group messages for deletion
  const [viewingGroupMessages, setViewingGroupMessages] = useState<{ groupId: string; messages: GroupMessage[] } | null>(null);
  const [loadingMessages, setLoadingMessages] = useState(false);

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
      const [storiesData, categoriesData, groupsData] = await Promise.all([
        fetchAllStories(),
        fetchCategories(),
        fetchChatGroups()
      ]);
      setStories(storiesData);
      setCategories(categoriesData);
      setChatGroups(groupsData as ExtendedChatGroup[]);

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

      // Fetch banned users
      const { data: bannedData } = await supabase
        .from('banned_users')
        .select('*')
        .order('created_at', { ascending: false });
      setBannedUsers((bannedData || []) as BannedUser[]);

      // Fetch all users via RPC function for admin
      const { data: usersData, error: usersError } = await supabase.rpc('get_admin_users');
      if (!usersError && usersData) {
        setAllUsers(usersData as AdminUser[]);
      }
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

  // Media rejection state
  const [rejectingMediaId, setRejectingMediaId] = useState<{ storyId: string; mediaId?: string } | null>(null);
  const [mediaRejectionReason, setMediaRejectionReason] = useState("");

  const handleMediaStatus = async (storyId: string, status: 'approved' | 'rejected', mediaId?: string, rejectionReason?: string) => {
    try {
      if (mediaId) {
        // Update story_media table for new multi-media
        await supabase
          .from('story_media')
          .update({ 
            media_status: status,
            rejection_reason: status === 'rejected' ? rejectionReason : null 
          })
          .eq('id', mediaId);
      } else {
        // Legacy: update stories table directly
        await supabase
          .from('stories')
          .update({ media_status: status })
          .eq('id', storyId);
      }
      
      setStories(stories.map(s => 
        s.id === storyId ? { ...s, media_status: status } : s
      ));
      setRejectingMediaId(null);
      setMediaRejectionReason("");
      toast({ title: status === 'approved' ? "Medien genehmigt" : "Medien abgelehnt" });
    } catch (error) {
      console.error('Error updating media status:', error);
      toast({ title: "Fehler", variant: "destructive" });
    }
  };

  const handleToggleVerified = async (storyId: string, currentlyVerified: boolean | undefined) => {
    try {
      const newVerifiedStatus = !currentlyVerified;
      await markStoryUnverified(storyId, newVerifiedStatus);
      setStories(stories.map(s => 
        s.id === storyId ? { ...s, is_verified: newVerifiedStatus } : s
      ));
      toast({ title: newVerifiedStatus ? "Als verifiziert markiert" : "Als nicht offiziell geprüft markiert" });
    } catch (error) {
      console.error('Error toggling verified status:', error);
      toast({ title: "Fehler", variant: "destructive" });
    }
  };

  const handleBanUser = async () => {
    if (!banningId || !banReason.trim() || !user) return;
    
    try {
      await supabase.from('banned_users').insert({
        user_id: banningId.type === 'user' ? banningId.id : null,
        anonymous_id: banningId.type === 'anonymous' ? banningId.id : null,
        reason: banReason.trim(),
        banned_by: user.id,
      });
      
      toast({ title: "Nutzer gesperrt" });
      setBanningId(null);
      setBanReason("");
      loadData();
    } catch (error) {
      console.error('Error banning user:', error);
      toast({ title: "Fehler", variant: "destructive" });
    }
  };

  const handleUnbanUser = async (banId: string) => {
    try {
      await supabase.from('banned_users').delete().eq('id', banId);
      setBannedUsers(bannedUsers.filter(b => b.id !== banId));
      toast({ title: "Sperre aufgehoben" });
    } catch (error) {
      console.error('Error unbanning user:', error);
      toast({ title: "Fehler", variant: "destructive" });
    }
  };

  const handleDeleteAccount = async (userId: string, username: string | null) => {
    if (!confirm(`Account "${username || 'Unbekannt'}" wirklich dauerhaft löschen? Diese Aktion kann nicht rückgängig gemacht werden.`)) return;
    
    try {
      const { data, error } = await supabase.rpc('admin_delete_user', { _user_id: userId });
      
      if (error) throw error;
      
      setAllUsers(allUsers.filter(u => u.id !== userId));
      toast({ title: "Account gelöscht" });
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({ 
        title: "Fehler beim Löschen", 
        description: "Account konnte nicht gelöscht werden.",
        variant: "destructive" 
      });
    }
  };

  const handleToggleGroupClosed = async (groupId: string, shouldClose: boolean) => {
    try {
      await supabase
        .from('chat_groups')
        .update({ 
          is_closed: shouldClose, 
          closed_reason: shouldClose ? closeReason || null : null,
          closed_by: shouldClose ? user?.id : null 
        })
        .eq('id', groupId);
      
      setChatGroups(chatGroups.map(g => 
        g.id === groupId ? { ...g, is_closed: shouldClose, closed_reason: shouldClose ? closeReason : null } : g
      ));
      setClosingGroupId(null);
      setCloseReason("");
      toast({ title: shouldClose ? "Gruppe geschlossen" : "Gruppe geöffnet" });
    } catch (error) {
      console.error('Error toggling group:', error);
      toast({ title: "Fehler", variant: "destructive" });
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm('Gruppe wirklich löschen? Alle Nachrichten werden gelöscht.')) return;
    
    try {
      await deleteChatGroup(groupId);
      setChatGroups(chatGroups.filter(g => g.id !== groupId));
      toast({ title: "Gruppe gelöscht" });
    } catch (error) {
      console.error('Error deleting group:', error);
      toast({ title: "Fehler beim Löschen", variant: "destructive" });
    }
  };

  const handleViewGroupMessages = async (groupId: string) => {
    setLoadingMessages(true);
    try {
      const messages = await fetchGroupMessages(groupId);
      setViewingGroupMessages({ groupId, messages });
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({ title: "Fehler", variant: "destructive" });
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleDeleteGroupMessage = async (messageId: string) => {
    if (!viewingGroupMessages) return;
    
    try {
      await deleteGroupMessage(messageId);
      setViewingGroupMessages({
        ...viewingGroupMessages,
        messages: viewingGroupMessages.messages.filter(m => m.id !== messageId)
      });
      toast({ title: "Nachricht gelöscht" });
    } catch (error) {
      console.error('Error deleting message:', error);
      toast({ title: "Fehler beim Löschen", variant: "destructive" });
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
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="font-display text-3xl font-bold mb-2 text-foreground">Admin Dashboard</h1>
              <p className="text-muted-foreground">Verwalte Storys, Meldungen und Nutzer</p>
            </div>
            <Link 
              to="/admin/stats" 
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              <BarChart3 className="w-4 h-4" />
              Statistiken
            </Link>
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
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {[
              { id: "stories", label: "Storys", icon: FileText, badge: pendingCount },
              { id: "eilmeldung", label: "Eilmeldung", icon: AlertTriangle },
              { id: "reports", label: "Meldungen", icon: Flag, badge: pendingReports },
              { id: "users", label: "Online", icon: Users, badge: onlineUsers.length },
              { id: "accounts", label: "Accounts", icon: UserCheck, badge: allUsers.length },
              { id: "groups", label: "Gruppen", icon: MessageCircle, badge: chatGroups.length },
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
                {tab.badge !== undefined && tab.badge > 0 && (
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
                          {story.is_verified === false && (
                            <span className="text-xs px-2 py-1 rounded-full bg-orange-500/20 text-orange-600 flex items-center gap-1">
                              ⚠️ Nicht offiziell geprüft
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

                    {/* Media Preview for Admin */}
                    {story.media_url && (
                      <div className="mb-4 p-3 bg-secondary/50 rounded-xl border border-border">
                        <div className="flex items-center gap-2 mb-2">
                          {story.media_type === 'image' ? (
                            <Image className="w-4 h-4 text-amber-500" />
                          ) : (
                            <Video className="w-4 h-4 text-amber-500" />
                          )}
                          <span className="text-sm font-medium text-foreground">
                            Anhang: {story.media_type === 'image' ? 'Bild' : 'Video'}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            story.media_status === 'approved' ? 'bg-green-500/20 text-green-600' :
                            story.media_status === 'rejected' ? 'bg-destructive/20 text-destructive' :
                            'bg-yellow-500/20 text-yellow-600'
                          }`}>
                            {story.media_status === 'approved' ? 'Genehmigt' :
                             story.media_status === 'rejected' ? 'Abgelehnt' : 'Prüfen'}
                          </span>
                        </div>
                        
                        {story.media_type === 'image' ? (
                          <img src={story.media_url} alt="Story Anhang" className="w-full max-h-40 object-cover rounded-lg" />
                        ) : (
                          <video src={story.media_url} controls className="w-full max-h-40 rounded-lg" />
                        )}
                        
                        {story.media_description && (
                          <p className="text-xs text-muted-foreground mt-2">
                            <strong>Beschreibung:</strong> {story.media_description}
                          </p>
                        )}
                        
                        {story.media_status === 'pending' && (
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => handleMediaStatus(story.id, 'approved')}
                              className="flex items-center gap-1 px-3 py-1 bg-green-500/20 text-green-600 rounded text-xs hover:bg-green-500/30"
                            >
                              <Check className="w-3 h-3" /> Medien OK
                            </button>
                            <button
                              onClick={() => setRejectingMediaId({ storyId: story.id })}
                              className="flex items-center gap-1 px-3 py-1 bg-destructive/20 text-destructive rounded text-xs hover:bg-destructive/30"
                            >
                              <X className="w-3 h-3" /> Ablehnen mit Grund
                            </button>
                          </div>
                        )}

                        {/* Rejection Reason Input */}
                        {rejectingMediaId?.storyId === story.id && !rejectingMediaId?.mediaId && (
                          <div className="mt-3 p-3 bg-destructive/10 rounded-lg border border-destructive/30">
                            <label className="block text-xs font-medium text-destructive mb-2">
                              Ablehnungsgrund:
                            </label>
                            <input
                              type="text"
                              value={mediaRejectionReason}
                              onChange={(e) => setMediaRejectionReason(e.target.value)}
                              placeholder="Grund für die Ablehnung..."
                              className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm"
                            />
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={() => handleMediaStatus(story.id, 'rejected', undefined, mediaRejectionReason)}
                                disabled={!mediaRejectionReason.trim()}
                                className="px-3 py-1 bg-destructive text-destructive-foreground rounded text-xs disabled:opacity-50"
                              >
                                Ablehnen
                              </button>
                              <button
                                onClick={() => { setRejectingMediaId(null); setMediaRejectionReason(""); }}
                                className="px-3 py-1 bg-secondary rounded text-xs"
                              >
                                Abbrechen
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    
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
                        {story.status === "published" && (
                          <button
                            onClick={() => handleToggleVerified(story.id, story.is_verified)}
                            className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
                              story.is_verified === false 
                                ? 'bg-green-500/20 text-green-600 hover:bg-green-500/30' 
                                : 'bg-orange-500/20 text-orange-600 hover:bg-orange-500/30'
                            }`}
                            title={story.is_verified === false ? "Als verifiziert markieren" : "Als nicht offiziell geprüft markieren"}
                          >
                            {story.is_verified === false ? (
                              <><ShieldCheck className="w-3 h-3" /> Verifizieren</>
                            ) : (
                              <><ShieldAlert className="w-3 h-3" /> Nicht geprüft</>
                            )}
                          </button>
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
              {reports.filter(r => r.content_type !== 'chat_message' && r.content_type !== 'group_message').length === 0 ? (
                <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground">
                  Keine Meldungen vorhanden.
                </div>
              ) : (
                reports
                  .filter(r => r.content_type !== 'chat_message' && r.content_type !== 'group_message')
                  .map((report) => (
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
              {/* Ban Modal */}
              {banningId && (
                <div className="bg-card border-2 border-destructive rounded-xl p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2 text-foreground">
                    <Ban className="w-5 h-5 text-destructive" />
                    Nutzer sperren
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {banningId.type === 'user' ? `User: ${banningId.id.slice(0, 8)}...` : `Anonym: ${banningId.id.slice(0, 8)}...`}
                  </p>
                  <input
                    type="text"
                    value={banReason}
                    onChange={(e) => setBanReason(e.target.value)}
                    placeholder="Grund für Sperre..."
                    className="w-full mb-3 px-3 py-2 bg-secondary border border-border rounded-lg text-foreground"
                  />
                  <div className="flex gap-2">
                    <button 
                      onClick={handleBanUser}
                      disabled={!banReason.trim()}
                      className="flex items-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg disabled:opacity-50"
                    >
                      <Ban className="w-4 h-4" /> Sperren
                    </button>
                    <button onClick={() => { setBanningId(null); setBanReason(""); }} className="px-4 py-2 bg-secondary text-foreground rounded-lg">
                      Abbrechen
                    </button>
                  </div>
                </div>
              )}

              {/* Banned Users */}
              {bannedUsers.length > 0 && (
                <div className="bg-card border border-border rounded-xl p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2 text-foreground">
                    <Ban className="w-5 h-5 text-destructive" />
                    Gesperrte Nutzer ({bannedUsers.length})
                  </h3>
                  <div className="space-y-2">
                    {bannedUsers.map((ban) => (
                      <div key={ban.id} className="flex items-center justify-between p-2 bg-destructive/10 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {ban.user_id ? `User ${ban.user_id.slice(0, 8)}...` : `Anonym ${ban.anonymous_id?.slice(0, 8)}...`}
                          </p>
                          <p className="text-xs text-muted-foreground">{ban.reason}</p>
                        </div>
                        <button
                          onClick={() => handleUnbanUser(ban.id)}
                          className="text-xs px-3 py-1 bg-green-500/20 text-green-600 rounded hover:bg-green-500/30"
                        >
                          Entsperren
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Online Users */}
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
                        <button
                          onClick={() => setBanningId({ 
                            type: presence.user_id ? 'user' : 'anonymous', 
                            id: presence.user_id || presence.anonymous_id || '' 
                          })}
                          className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                          title="Nutzer sperren"
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Accounts Tab */}
          {activeTab === "accounts" && (
            <div className="space-y-4">
              <div className="bg-card border border-border rounded-xl p-4">
                <h3 className="font-semibold mb-4 flex items-center gap-2 text-foreground">
                  <UserCheck className="w-5 h-5 text-primary" />
                  Alle registrierten Accounts ({allUsers.length})
                </h3>
                {allUsers.length === 0 ? (
                  <p className="text-muted-foreground text-sm">Keine registrierten Nutzer.</p>
                ) : (
                  <div className="space-y-3">
                    {allUsers.map((u) => (
                      <div key={u.id} className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
                        <div className="relative">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center overflow-hidden ${
                            u.role === 'admin' 
                              ? 'bg-gradient-to-br from-amber-400 to-amber-600' 
                              : 'bg-primary/20'
                          }`}>
                            {u.avatar_url ? (
                              <img src={u.avatar_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <Users className={`w-5 h-5 ${u.role === 'admin' ? 'text-amber-900' : 'text-primary'}`} />
                            )}
                          </div>
                          {u.role === 'admin' && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center shadow-sm">
                              <Crown className="w-3 h-3 text-amber-900" />
                            </div>
                          )}
                          {u.is_online && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-secondary" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-foreground truncate">
                              {u.username || 'Unbekannt'}
                            </p>
                            {u.role === 'admin' && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 flex items-center gap-1">
                                <Crown className="w-3 h-3" /> Admin
                              </span>
                            )}
                            {u.is_private && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                                Privat
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Seit {new Date(u.created_at).toLocaleDateString('de-DE')}
                            {u.is_online && <span className="text-green-500 ml-2">● Online</span>}
                          </p>
                        </div>
                        <button
                          onClick={() => setBanningId({ type: 'user', id: u.id })}
                          className="p-2 text-muted-foreground hover:text-yellow-600 hover:bg-yellow-500/10 rounded-lg transition-colors"
                          title="Nutzer sperren"
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteAccount(u.id, u.username)}
                          className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                          title="Account löschen"
                        >
                          <UserX className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Groups Tab */}
          {activeTab === "groups" && (
            <div className="space-y-4">
              {/* Close Group Modal */}
              {closingGroupId && (
                <div className="bg-card border-2 border-yellow-500 rounded-xl p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2 text-foreground">
                    <Lock className="w-5 h-5 text-yellow-600" />
                    Gruppe vorübergehend schließen
                  </h3>
                  <input
                    type="text"
                    value={closeReason}
                    onChange={(e) => setCloseReason(e.target.value)}
                    placeholder="Grund für Schließung (optional)..."
                    className="w-full mb-3 px-3 py-2 bg-secondary border border-border rounded-lg text-foreground"
                  />
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleToggleGroupClosed(closingGroupId, true)}
                      className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg"
                    >
                      <Lock className="w-4 h-4" /> Schließen
                    </button>
                    <button onClick={() => { setClosingGroupId(null); setCloseReason(""); }} className="px-4 py-2 bg-secondary text-foreground rounded-lg">
                      Abbrechen
                    </button>
                  </div>
                </div>
              )}

              {/* View Group Messages Modal */}
              {viewingGroupMessages && (
                <div className="bg-card border-2 border-primary rounded-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold flex items-center gap-2 text-foreground">
                      <MessageSquare className="w-5 h-5 text-primary" />
                      Nachrichten in Gruppe
                    </h3>
                    <button 
                      onClick={() => setViewingGroupMessages(null)} 
                      className="px-3 py-1 bg-secondary text-foreground rounded-lg text-sm"
                    >
                      Schließen
                    </button>
                  </div>
                  {viewingGroupMessages.messages.length === 0 ? (
                    <p className="text-muted-foreground text-sm">Keine Nachrichten vorhanden.</p>
                  ) : (
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                      {viewingGroupMessages.messages.map((msg) => (
                        <div key={msg.id} className="flex items-start justify-between gap-2 p-2 bg-secondary rounded-lg">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-primary font-medium">{msg.nickname}</p>
                            <p className="text-sm text-foreground break-words">{msg.content}</p>
                            <p className="text-xs text-muted-foreground">{new Date(msg.created_at).toLocaleString('de-DE')}</p>
                          </div>
                          <button
                            onClick={() => handleDeleteGroupMessage(msg.id)}
                            className="p-1.5 text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                            title="Löschen"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {chatGroups.length === 0 ? (
                <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground">
                  Keine Gruppen vorhanden.
                </div>
              ) : (
                chatGroups.map((group) => (
                  <div key={group.id} className={`bg-card border rounded-xl p-4 ${group.is_closed ? 'border-yellow-500/50' : 'border-border'}`}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${group.is_closed ? 'bg-yellow-500/20' : 'bg-primary/20'}`}>
                          {group.is_closed ? <Lock className="w-5 h-5 text-yellow-600" /> : <MessageCircle className="w-5 h-5 text-primary" />}
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground">{group.name}</h4>
                          {group.description && <p className="text-xs text-muted-foreground">{group.description}</p>}
                          {group.is_closed && group.closed_reason && (
                            <p className="text-xs text-yellow-600 mt-1">Grund: {group.closed_reason}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => handleViewGroupMessages(group.id)}
                          disabled={loadingMessages}
                          className="flex items-center gap-1 px-3 py-2 bg-secondary text-foreground rounded-lg text-sm hover:bg-secondary/80"
                        >
                          <MessageSquare className="w-4 h-4" /> Nachrichten
                        </button>
                        {group.is_closed ? (
                          <button
                            onClick={() => handleToggleGroupClosed(group.id, false)}
                            className="flex items-center gap-1 px-3 py-2 bg-green-500/20 text-green-600 rounded-lg text-sm hover:bg-green-500/30"
                          >
                            <Unlock className="w-4 h-4" /> Öffnen
                          </button>
                        ) : (
                          <button
                            onClick={() => setClosingGroupId(group.id)}
                            className="flex items-center gap-1 px-3 py-2 bg-yellow-500/20 text-yellow-600 rounded-lg text-sm hover:bg-yellow-500/30"
                          >
                            <Lock className="w-4 h-4" /> Schließen
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteGroup(group.id)}
                          className="flex items-center gap-1 px-3 py-2 bg-destructive/20 text-destructive rounded-lg text-sm hover:bg-destructive/30"
                        >
                          <Trash2 className="w-4 h-4" /> Löschen
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminPage;