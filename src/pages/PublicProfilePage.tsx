import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Footer } from "@/components/shared/Footer";
import { 
  User, 
  MessageSquare, 
  FileText, 
  Heart,
  Flag,
  Loader2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAnonymousId } from "@/hooks/useAnonymousId";
import { useToast } from "@/hooks/use-toast";
import { ReportModal } from "@/components/shared/ReportModal";

interface PublicProfile {
  id: string;
  username: string | null;
  bio: string | null;
  avatar_url: string | null;
  likes_count: number;
  created_at: string;
}

const PublicProfilePage = () => {
  const { username } = useParams<{ username: string }>();
  const { user } = useAuth();
  const { anonymousId } = useAnonymousId();
  const { toast } = useToast();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLiked, setHasLiked] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const [storyCount, setStoryCount] = useState(0);

  useEffect(() => {
    loadProfile();
  }, [username]);

  const loadProfile = async () => {
    if (!username) return;
    
    try {
      // Fetch profile by username
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .maybeSingle();

      if (profileError) throw profileError;
      if (!profileData) {
        setProfile(null);
        return;
      }

      setProfile(profileData as PublicProfile);

      // Fetch comment count
      const { count: comments } = await supabase
        .from('comments')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', profileData.id);
      
      setCommentCount(comments || 0);

      // Fetch story count
      const { count: stories } = await supabase
        .from('stories')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', profileData.id)
        .eq('status', 'published');
      
      setStoryCount(stories || 0);

      // Check if current user liked this profile
      if (user || anonymousId) {
        const { data: likeData } = await supabase
          .from('profile_likes')
          .select('id')
          .eq('profile_id', profileData.id)
          .or(user ? `liker_user_id.eq.${user.id}` : `liker_anonymous_id.eq.${anonymousId}`)
          .maybeSingle();
        
        setHasLiked(!!likeData);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast({ title: "Fehler", description: "Profil konnte nicht geladen werden.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async () => {
    if (!profile) return;

    try {
      if (hasLiked) {
        // Remove like
        await supabase
          .from('profile_likes')
          .delete()
          .eq('profile_id', profile.id)
          .or(user ? `liker_user_id.eq.${user.id}` : `liker_anonymous_id.eq.${anonymousId}`);
        
        setHasLiked(false);
        setProfile(prev => prev ? { ...prev, likes_count: prev.likes_count - 1 } : null);
      } else {
        // Add like
        await supabase
          .from('profile_likes')
          .insert({
            profile_id: profile.id,
            liker_user_id: user?.id || null,
            liker_anonymous_id: !user ? anonymousId : null,
          });
        
        setHasLiked(true);
        setProfile(prev => prev ? { ...prev, likes_count: prev.likes_count + 1 } : null);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({ title: "Fehler", variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (!profile) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12 text-center">
          <User className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="font-display text-2xl font-bold mb-2">Profil nicht gefunden</h1>
          <p className="text-muted-foreground">Dieses Profil existiert nicht.</p>
        </div>
        <Footer />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="glass-card p-6">
          {/* Header */}
          <div className="flex items-start gap-4 mb-6">
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.username || ''} className="w-full h-full rounded-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-primary" />
              )}
            </div>
            <div className="flex-1">
              <h1 className="font-display text-2xl font-bold">
                {profile.username || 'Anonym'}
              </h1>
              {profile.bio && (
                <p className="text-muted-foreground mt-1">{profile.bio}</p>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                Mitglied seit {new Date(profile.created_at).toLocaleDateString('de-DE')}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-secondary/50 p-3 rounded-xl text-center">
              <Heart className="w-5 h-5 mx-auto mb-1 text-primary" />
              <p className="text-lg font-bold">{profile.likes_count}</p>
              <p className="text-xs text-muted-foreground">Likes</p>
            </div>
            <div className="bg-secondary/50 p-3 rounded-xl text-center">
              <MessageSquare className="w-5 h-5 mx-auto mb-1 text-primary" />
              <p className="text-lg font-bold">{commentCount}</p>
              <p className="text-xs text-muted-foreground">Kommentare</p>
            </div>
            <div className="bg-secondary/50 p-3 rounded-xl text-center">
              <FileText className="w-5 h-5 mx-auto mb-1 text-primary" />
              <p className="text-lg font-bold">{storyCount}</p>
              <p className="text-xs text-muted-foreground">Storys</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleLike}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${
                hasLiked
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary hover:bg-secondary/80'
              }`}
            >
              <Heart className={`w-5 h-5 ${hasLiked ? 'fill-current' : ''}`} />
              {hasLiked ? 'Gefällt mir' : 'Like'}
            </button>
            <button
              onClick={() => setShowReport(true)}
              className="p-3 bg-secondary hover:bg-secondary/80 rounded-xl transition-colors"
            >
              <Flag className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>

      <Footer />

      <ReportModal
        isOpen={showReport}
        onClose={() => setShowReport(false)}
        contentType="profile"
        contentId={profile.id}
      />
    </MainLayout>
  );
};

export default PublicProfilePage;
