import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { AuthModal } from "@/components/auth/AuthModal";
import { 
  Plus, 
  Users, 
  MessageCircle,
  Loader2,
  X
} from "lucide-react";
import { fetchChatGroups, createChatGroup } from "@/lib/api";
import type { ChatGroup } from "@/types/database";

const ChatGroupsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [groups, setGroups] = useState<ChatGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '', description: '' });
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      const data = await fetchChatGroups();
      setGroups(data);
    } catch (error) {
      console.error('Error loading groups:', error);
      toast({
        title: "Fehler",
        description: "Gruppen konnten nicht geladen werden.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroup.name.trim() || !user) return;

    setIsCreating(true);
    try {
      const created = await createChatGroup({
        name: newGroup.name.trim(),
        description: newGroup.description.trim() || undefined,
        creator_id: user.id
      });
      setGroups([created, ...groups]);
      setShowCreateModal(false);
      setNewGroup({ name: '', description: '' });
      toast({ title: "Gruppe erstellt!" });
      navigate(`/gruppen/${created.id}`);
    } catch (error) {
      console.error('Error creating group:', error);
      toast({
        title: "Fehler",
        description: "Gruppe konnte nicht erstellt werden.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleNewGroupClick = () => {
    if (!user) {
      setShowAuthModal(true);
    } else {
      setShowCreateModal(true);
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold">Chatgruppen</h1>
            <p className="text-sm text-muted-foreground">Öffentliche Gruppen zum Chatten</p>
          </div>
          <button
            onClick={handleNewGroupClick}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:neon-glow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Neue Gruppe
          </button>
        </div>

        {/* Main Chat Link */}
        <Link
          to="/chat"
          className="glass-card p-4 mb-6 flex items-center gap-4 hover:bg-secondary/50 transition-colors"
        >
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
            <MessageCircle className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Community Chat</h3>
            <p className="text-sm text-muted-foreground">Der Hauptchat für alle Stader</p>
          </div>
        </Link>

        {/* Groups List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : groups.length > 0 ? (
          <div className="space-y-3">
            {groups.map((group) => (
              <Link
                key={group.id}
                to={`/gruppen/${group.id}`}
                className="glass-card p-4 flex items-center gap-4 hover:bg-secondary/50 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                  <Users className="w-6 h-6 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{group.name}</h3>
                  {group.description && (
                    <p className="text-sm text-muted-foreground line-clamp-1">{group.description}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Erstellt von {group.creator?.username || 'Anonym'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Noch keine Gruppen vorhanden.</p>
            <p className="text-sm mt-1">Erstelle die erste Gruppe!</p>
          </div>
        )}
      </div>

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
          
          <div className="relative glass-card w-full max-w-md p-6 animate-scale-in">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-secondary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="font-display text-xl font-bold mb-4">Neue Gruppe erstellen</h2>

            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Gruppenname</label>
                <input
                  type="text"
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                  placeholder="z.B. Stade Fußball Fans"
                  className="w-full px-4 py-3 bg-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Beschreibung (optional)</label>
                <textarea
                  value={newGroup.description}
                  onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                  placeholder="Worum geht es in dieser Gruppe?"
                  rows={3}
                  className="w-full px-4 py-3 bg-secondary border border-border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <button
                type="submit"
                disabled={isCreating || !newGroup.name.trim()}
                className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:neon-glow-sm transition-all disabled:opacity-50"
              >
                {isCreating ? 'Erstellen...' : 'Gruppe erstellen'}
              </button>
            </form>
          </div>
        </div>
      )}

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title="Anmelden um Gruppe zu erstellen"
        showAnonymousOption={false}
      />
    </MainLayout>
  );
};

export default ChatGroupsPage;