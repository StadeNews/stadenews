import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { 
  User, 
  MessageSquare, 
  FileText, 
  Settings, 
  Loader2,
  Edit2,
  Check,
  X
} from "lucide-react";
import { 
  fetchUserProfile, 
  fetchUserComments, 
  fetchUserStories,
  updateUserProfile
} from "@/lib/api";
import type { Profile, Comment, Story } from "@/types/database";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading, signOut } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"comments" | "stories">("comments");
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/');
      return;
    }

    if (user) {
      loadData();
    }
  }, [user, authLoading, navigate]);

  const loadData = async () => {
    if (!user) return;
    
    try {
      const [profileData, commentsData, storiesData] = await Promise.all([
        fetchUserProfile(user.id),
        fetchUserComments(user.id),
        fetchUserStories(user.id)
      ]);
      setProfile(profileData);
      setComments(commentsData);
      setStories(storiesData);
      setNewUsername(profileData?.username || '');
    } catch (error) {
      console.error('Error loading profile:', error);
      toast({
        title: "Fehler",
        description: "Profil konnte nicht geladen werden.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateUsername = async () => {
    if (!user || !newUsername.trim()) return;
    
    try {
      await updateUserProfile(user.id, { username: newUsername.trim() });
      setProfile(prev => prev ? { ...prev, username: newUsername.trim() } : null);
      setIsEditingUsername(false);
      toast({ title: "Username aktualisiert!" });
    } catch (error) {
      console.error('Error updating username:', error);
      toast({
        title: "Fehler",
        description: "Username konnte nicht aktualisiert werden.",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
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

  if (!user) {
    return null;
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Profile Header */}
        <div className="glass-card p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1">
              {isEditingUsername ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="px-3 py-2 bg-secondary border border-border rounded-lg text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-primary/50"
                    autoFocus
                  />
                  <button
                    onClick={handleUpdateUsername}
                    className="p-2 bg-success/20 text-success rounded-lg hover:bg-success/30"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingUsername(false);
                      setNewUsername(profile?.username || '');
                    }}
                    className="p-2 bg-destructive/20 text-destructive rounded-lg hover:bg-destructive/30"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h1 className="font-display text-2xl font-bold">
                    {profile?.username || user.email?.split('@')[0]}
                  </h1>
                  <button
                    onClick={() => setIsEditingUsername(true)}
                    className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              )}
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Mitglied seit {formatDate(profile?.created_at || user.created_at || '')}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-secondary/50 p-3 rounded-xl text-center">
              <p className="text-xl font-bold">{comments.length}</p>
              <p className="text-xs text-muted-foreground">Kommentare</p>
            </div>
            <div className="bg-secondary/50 p-3 rounded-xl text-center">
              <p className="text-xl font-bold">{stories.length}</p>
              <p className="text-xs text-muted-foreground">Meldungen</p>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="w-full py-2 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors text-sm"
          >
            Abmelden
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab("comments")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === "comments"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Kommentare
          </button>
          <button
            onClick={() => setActiveTab("stories")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === "stories"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileText className="w-4 h-4" />
            Meldungen
          </button>
        </div>

        {/* Content */}
        <div className="space-y-3">
          {activeTab === "comments" ? (
            comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.id} className="glass-card p-4">
                  <p className="text-sm mb-2">{comment.content}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(comment.created_at)}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Du hast noch keine Kommentare geschrieben.
              </div>
            )
          ) : (
            stories.length > 0 ? (
              stories.map((story) => (
                <div key={story.id} className="glass-card p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-secondary">
                      {story.category?.name || 'Unkategorisiert'}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      story.status === 'published' 
                        ? 'bg-success/20 text-success' 
                        : story.status === 'pending'
                        ? 'bg-warning/20 text-warning'
                        : 'bg-destructive/20 text-destructive'
                    }`}>
                      {story.status === 'published' ? 'Veröffentlicht' : story.status === 'pending' ? 'Offen' : 'Abgelehnt'}
                    </span>
                  </div>
                  {story.title && <h3 className="font-semibold mb-1">{story.title}</h3>}
                  <p className="text-sm text-muted-foreground line-clamp-2">{story.content}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {formatDate(story.created_at)}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Du hast noch keine Meldungen eingereicht.
              </div>
            )
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default ProfilePage;