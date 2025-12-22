import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Bell, 
  Video, 
  Instagram, 
  Facebook, 
  Megaphone,
  Plus,
  X,
  Loader2,
  ExternalLink
} from "lucide-react";

interface Update {
  id: string;
  title: string;
  content: string;
  update_type: string;
  external_url?: string;
  created_at: string;
}

const UpdatesPage = () => {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [updates, setUpdates] = useState<Update[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newUpdate, setNewUpdate] = useState({
    title: '',
    content: '',
    update_type: 'general',
    external_url: ''
  });

  useEffect(() => {
    loadUpdates();
  }, []);

  const loadUpdates = async () => {
    try {
      const { data, error } = await supabase
        .from('updates')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUpdates(data || []);
    } catch (error) {
      console.error('Error loading updates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUpdate.title.trim() || !newUpdate.content.trim()) return;

    setIsCreating(true);
    try {
      const { error } = await supabase
        .from('updates')
        .insert({
          title: newUpdate.title.trim(),
          content: newUpdate.content.trim(),
          update_type: newUpdate.update_type,
          external_url: newUpdate.external_url.trim() || null
        });

      if (error) throw error;

      toast({ title: "Update veröffentlicht!" });
      setShowCreateModal(false);
      setNewUpdate({ title: '', content: '', update_type: 'general', external_url: '' });
      loadUpdates();
    } catch (error) {
      console.error('Error creating update:', error);
      toast({
        title: "Fehler",
        description: "Update konnte nicht erstellt werden.",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'tiktok':
        return <Video className="w-5 h-5" />;
      case 'instagram':
        return <Instagram className="w-5 h-5" />;
      case 'facebook':
        return <Facebook className="w-5 h-5" />;
      default:
        return <Megaphone className="w-5 h-5" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'tiktok': return 'TikTok';
      case 'instagram': return 'Instagram';
      case 'facebook': return 'Facebook';
      default: return 'Allgemein';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'tiktok': return 'bg-pink-500/10 text-pink-500';
      case 'instagram': return 'bg-purple-500/10 text-purple-500';
      case 'facebook': return 'bg-blue-500/10 text-blue-500';
      default: return 'bg-primary/10 text-primary';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold flex items-center gap-2">
              <Bell className="w-6 h-6 text-primary" />
              Updates
            </h1>
            <p className="text-sm text-muted-foreground">Neuigkeiten von Stade News</p>
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary text-sm"
            >
              <Plus className="w-4 h-4" />
              Neues Update
            </button>
          )}
        </div>

        {/* Updates List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : updates.length > 0 ? (
          <div className="space-y-4">
            {updates.map((update) => (
              <article key={update.id} className="news-card p-5">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${getTypeColor(update.update_type)}`}>
                    {getTypeIcon(update.update_type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getTypeColor(update.update_type)}`}>
                        {getTypeLabel(update.update_type)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(update.created_at)}
                      </span>
                    </div>
                    <h3 className="font-display font-bold text-lg mb-2">{update.title}</h3>
                    <p className="text-muted-foreground text-sm mb-3">{update.content}</p>
                    {update.external_url && (
                      <a
                        href={update.external_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-primary text-sm font-medium hover:underline"
                      >
                        Zum Beitrag <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 news-card">
            <Bell className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">Noch keine Updates vorhanden.</p>
          </div>
        )}
      </div>

      {/* Create Update Modal (Admin only) */}
      {showCreateModal && isAdmin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
          
          <div className="relative bg-card border border-border w-full max-w-md p-6 rounded-xl shadow-xl animate-scale-in">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-secondary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="font-display text-xl font-bold mb-4">Neues Update erstellen</h2>

            <form onSubmit={handleCreateUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Typ</label>
                <select
                  value={newUpdate.update_type}
                  onChange={(e) => setNewUpdate({ ...newUpdate, update_type: e.target.value })}
                  className="input-field"
                >
                  <option value="general">Allgemein</option>
                  <option value="tiktok">TikTok Video</option>
                  <option value="instagram">Instagram Post</option>
                  <option value="facebook">Facebook Post</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Titel</label>
                <input
                  type="text"
                  value={newUpdate.title}
                  onChange={(e) => setNewUpdate({ ...newUpdate, title: e.target.value })}
                  placeholder="z.B. Neues Video auf TikTok!"
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Inhalt</label>
                <textarea
                  value={newUpdate.content}
                  onChange={(e) => setNewUpdate({ ...newUpdate, content: e.target.value })}
                  placeholder="Was gibt's Neues?"
                  rows={3}
                  className="input-field resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Link (optional)</label>
                <input
                  type="url"
                  value={newUpdate.external_url}
                  onChange={(e) => setNewUpdate({ ...newUpdate, external_url: e.target.value })}
                  placeholder="https://..."
                  className="input-field"
                />
              </div>

              <button
                type="submit"
                disabled={isCreating || !newUpdate.title.trim() || !newUpdate.content.trim()}
                className="btn-primary w-full"
              >
                {isCreating ? 'Veröffentlichen...' : 'Update veröffentlichen'}
              </button>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default UpdatesPage;