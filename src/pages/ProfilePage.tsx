import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  User, 
  MessageSquare, 
  FileText, 
  Loader2,
  Edit2,
  Check,
  X,
  Music,
  Camera,
  Play,
  Pause
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
  
  // Editing states
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newBio, setNewBio] = useState("");
  
  // File upload states
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  
  // Audio player
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

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
      setNewBio(profileData?.bio || '');
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

  const handleUpdateBio = async () => {
    if (!user) return;
    
    try {
      await updateUserProfile(user.id, { bio: newBio.trim() });
      setProfile(prev => prev ? { ...prev, bio: newBio.trim() } : null);
      setIsEditingBio(false);
      toast({ title: "Bio aktualisiert!" });
    } catch (error) {
      console.error('Error updating bio:', error);
      toast({
        title: "Fehler",
        description: "Bio konnte nicht aktualisiert werden.",
        variant: "destructive",
      });
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Fehler",
        description: "Bitte wähle eine Bilddatei aus.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Fehler",
        description: "Die Datei darf maximal 2MB groß sein.",
        variant: "destructive",
      });
      return;
    }

    setUploadingAvatar(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      await updateUserProfile(user.id, { avatar_url: publicUrl });
      setProfile(prev => prev ? { ...prev, avatar_url: publicUrl } : null);
      toast({ title: "Profilbild aktualisiert!" });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Fehler",
        description: "Profilbild konnte nicht hochgeladen werden.",
        variant: "destructive",
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('audio/')) {
      toast({
        title: "Fehler",
        description: "Bitte wähle eine Audiodatei aus.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Fehler",
        description: "Die Datei darf maximal 10MB groß sein.",
        variant: "destructive",
      });
      return;
    }

    setUploadingAudio(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/song.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('audio')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('audio')
        .getPublicUrl(filePath);

      await updateUserProfile(user.id, { audio_url: publicUrl });
      setProfile(prev => prev ? { ...prev, audio_url: publicUrl } : null);
      toast({ title: "Profilsong aktualisiert!" });
    } catch (error) {
      console.error('Error uploading audio:', error);
      toast({
        title: "Fehler",
        description: "Audiodatei konnte nicht hochgeladen werden.",
        variant: "destructive",
      });
    } finally {
      setUploadingAudio(false);
    }
  };

  const toggleAudioPlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
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
        <div className="bg-card border border-border rounded-xl p-6 mb-6 shadow-sm">
          <div className="flex items-start gap-4 mb-6">
            {/* Avatar with upload */}
            <div className="relative group">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border-2 border-border">
                {profile?.avatar_url ? (
                  <img 
                    src={profile.avatar_url} 
                    alt="Avatar" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-10 h-10 text-primary" />
                )}
              </div>
              <button
                onClick={() => avatarInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                {uploadingAvatar ? (
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                ) : (
                  <Camera className="w-5 h-5 text-white" />
                )}
              </button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>

            <div className="flex-1">
              {/* Username */}
              {isEditingUsername ? (
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="px-3 py-2 bg-secondary border border-border rounded-lg text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-primary/50"
                    autoFocus
                  />
                  <button
                    onClick={handleUpdateUsername}
                    className="p-2 bg-green-500/20 text-green-600 rounded-lg hover:bg-green-500/30"
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
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="font-display text-2xl font-bold text-foreground">
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

          {/* Bio */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-foreground">Bio</label>
              {!isEditingBio && (
                <button
                  onClick={() => setIsEditingBio(true)}
                  className="text-xs text-primary hover:underline"
                >
                  Bearbeiten
                </button>
              )}
            </div>
            {isEditingBio ? (
              <div className="space-y-2">
                <textarea
                  value={newBio}
                  onChange={(e) => setNewBio(e.target.value)}
                  placeholder="Erzähle etwas über dich..."
                  className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  rows={3}
                  maxLength={300}
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{newBio.length}/300</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setIsEditingBio(false);
                        setNewBio(profile?.bio || '');
                      }}
                      className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground"
                    >
                      Abbrechen
                    </button>
                    <button
                      onClick={handleUpdateBio}
                      className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                    >
                      Speichern
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground bg-secondary/50 rounded-lg p-3">
                {profile?.bio || "Noch keine Bio vorhanden."}
              </p>
            )}
          </div>

          {/* Profile Song */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Music className="w-4 h-4" />
                Profilsong
              </label>
              <button
                onClick={() => audioInputRef.current?.click()}
                disabled={uploadingAudio}
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                {uploadingAudio ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Lädt...
                  </>
                ) : (
                  'Song ändern'
                )}
              </button>
              <input
                ref={audioInputRef}
                type="file"
                accept="audio/*"
                onChange={handleAudioUpload}
                className="hidden"
              />
            </div>
            {profile?.audio_url ? (
              <div className="flex items-center gap-3 bg-secondary/50 rounded-lg p-3">
                <button
                  onClick={toggleAudioPlayback}
                  className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                </button>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Dein Profilsong</p>
                  <p className="text-xs text-muted-foreground">Klicke zum Abspielen</p>
                </div>
                <audio
                  ref={audioRef}
                  src={profile.audio_url}
                  onEnded={() => setIsPlaying(false)}
                />
              </div>
            ) : (
              <div className="text-sm text-muted-foreground bg-secondary/50 rounded-lg p-3 text-center">
                Noch kein Profilsong hochgeladen.
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-secondary/50 p-3 rounded-xl text-center">
              <p className="text-xl font-bold text-foreground">{comments.length}</p>
              <p className="text-xs text-muted-foreground">Kommentare</p>
            </div>
            <div className="bg-secondary/50 p-3 rounded-xl text-center">
              <p className="text-xl font-bold text-foreground">{stories.length}</p>
              <p className="text-xs text-muted-foreground">Meldungen</p>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="w-full py-2.5 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors text-sm font-medium"
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
                <div key={comment.id} className="bg-card border border-border rounded-xl p-4">
                  <p className="text-sm mb-2 text-foreground">{comment.content}</p>
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
                <div key={story.id} className="bg-card border border-border rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-foreground">
                      {story.category?.name || 'Unkategorisiert'}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      story.status === 'published' 
                        ? 'bg-green-500/20 text-green-600' 
                        : story.status === 'pending'
                        ? 'bg-yellow-500/20 text-yellow-600'
                        : 'bg-destructive/20 text-destructive'
                    }`}>
                      {story.status === 'published' ? 'Veröffentlicht' : story.status === 'pending' ? 'Offen' : 'Abgelehnt'}
                    </span>
                  </div>
                  {story.title && <h3 className="font-semibold mb-1 text-foreground">{story.title}</h3>}
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