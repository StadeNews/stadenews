import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { SpottedCard } from '@/components/spotted/SpottedCard';
import { NewsCardSkeleton } from '@/components/shared/SkeletonLoaders';
import { AuthModal } from '@/components/auth/AuthModal';
import { useAuth } from '@/hooks/useAuth';
import { useAnonymousId } from '@/hooks/useAnonymousId';
import { useAnonymousPreference } from '@/hooks/useAnonymousPreference';
import { useToast } from '@/hooks/use-toast';
import { fetchSpottedPosts, createSpottedPost } from '@/lib/spotted-api';
import { generateNickname } from '@/hooks/useAnonymousId';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Heart, MapPin, Calendar, Clock, X, Loader2, Search, Filter, Image, Video, AlertCircle } from 'lucide-react';
import type { Spotted } from '@/types/spotted';

interface MediaFile {
  id: string;
  url: string;
  type: 'image' | 'video';
  description: string;
}

const SpottedPage = () => {
  const { user } = useAuth();
  const { anonymousId } = useAnonymousId();
  const { preferAnonymous, savePreference } = useAnonymousPreference();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [posts, setPosts] = useState<Spotted[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [form, setForm] = useState({
    title: '',
    content: '',
    location: '',
    spotted_date: '',
    spotted_time: ''
  });
  const [filters, setFilters] = useState({
    searchText: '',
    location: '',
    dateFrom: '',
    dateTo: ''
  });

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async (applyFilters = false) => {
    setIsLoading(true);
    try {
      const filterParams = applyFilters ? {
        searchText: filters.searchText || undefined,
        location: filters.location || undefined,
        dateFrom: filters.dateFrom || undefined,
        dateTo: filters.dateTo || undefined,
      } : undefined;
      const data = await fetchSpottedPosts(filterParams);
      setPosts(data);
    } catch (error) {
      console.error('Error loading spotted posts:', error);
      toast({ title: "Fehler", description: "Posts konnten nicht geladen werden.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    loadPosts(true);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilters({ searchText: '', location: '', dateFrom: '', dateTo: '' });
    loadPosts(false);
  };

  const handleCreateClick = () => {
    if (preferAnonymous === true) {
      setShowCreateModal(true);
    } else if (!user) {
      setShowAuthModal(true);
    } else {
      setShowCreateModal(true);
    }
  };

  const handleAuthModalClose = (action?: 'login' | 'anonymous') => {
    setShowAuthModal(false);
    if (action === 'anonymous') {
      savePreference(true);
      setShowCreateModal(true);
    }
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (mediaFiles.length + files.length > 5) {
      toast({ title: "Zu viele Dateien", description: "Maximal 5 Bilder/Videos erlaubt.", variant: "destructive" });
      return;
    }

    setIsUploadingMedia(true);

    try {
      for (const file of Array.from(files)) {
        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');
        
        if (!isImage && !isVideo) {
          toast({ title: "Fehler", description: `${file.name}: Nur Bilder und Videos erlaubt.`, variant: "destructive" });
          continue;
        }

        const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
        if (file.size > maxSize) {
          toast({ title: "Datei zu groß", description: `${file.name}: Max ${isVideo ? '50MB' : '10MB'}.`, variant: "destructive" });
          continue;
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `spotted/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('story-media')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('story-media')
          .getPublicUrl(filePath);

        setMediaFiles(prev => [...prev, {
          id: fileName,
          url: publicUrl,
          type: isImage ? 'image' : 'video',
          description: ''
        }]);
      }
    } catch (error) {
      console.error('Error uploading media:', error);
      toast({ title: "Upload fehlgeschlagen", variant: "destructive" });
    } finally {
      setIsUploadingMedia(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveMedia = (mediaId: string) => {
    setMediaFiles(prev => prev.filter(m => m.id !== mediaId));
  };

  const handleUpdateMediaDescription = (mediaId: string, description: string) => {
    setMediaFiles(prev => prev.map(m => 
      m.id === mediaId ? { ...m, description } : m
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.title.trim() || !form.content.trim()) {
      toast({ title: "Fehler", description: "Titel und Beschreibung sind erforderlich.", variant: "destructive" });
      return;
    }

    // Check media descriptions
    const missingDescriptions = mediaFiles.filter(m => !m.description.trim());
    if (missingDescriptions.length > 0) {
      toast({ title: "Beschreibung fehlt", description: "Bitte beschreibe alle hochgeladenen Medien.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const isAnonymous = preferAnonymous === true || !user;
      
      await createSpottedPost({
        title: form.title.trim(),
        content: form.content.trim(),
        location: form.location.trim() || undefined,
        spotted_date: form.spotted_date || undefined,
        spotted_time: form.spotted_time || undefined,
        user_id: isAnonymous ? undefined : user?.id,
        anonymous_author: isAnonymous ? generateNickname() : undefined,
        media_files: mediaFiles.length > 0 ? mediaFiles.map(m => ({
          url: m.url,
          type: m.type,
          description: m.description
        })) : undefined
      });

      toast({ 
        title: "Spotted gepostet!", 
        description: mediaFiles.length > 0 ? "Medien werden separat geprüft." : undefined
      });
      setShowCreateModal(false);
      setForm({ title: '', content: '', location: '', spotted_date: '', spotted_time: '' });
      setMediaFiles([]);
      loadPosts();
    } catch (error) {
      console.error('Error creating spotted:', error);
      toast({ title: "Fehler", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasActiveFilters = filters.searchText || filters.location || filters.dateFrom || filters.dateTo;

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-3xl font-bold text-headline flex items-center gap-3">
              <Heart className="w-8 h-8 text-pink-500" />
              Spotted
            </h1>
            <p className="text-muted-foreground mt-1">
              Jemanden gesehen und willst ihn/sie kennenlernen?
            </p>
          </div>
          <button
            onClick={handleCreateClick}
            className="btn-primary bg-pink-500 hover:bg-pink-600"
          >
            <Plus className="w-5 h-5" />
            Posten
          </button>
        </div>

        {/* Search & Filters */}
        <div className="glass-card p-4 mb-6">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={filters.searchText}
                onChange={(e) => setFilters({ ...filters, searchText: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Suche nach Beschreibung..."
                className="w-full pl-10 pr-4 py-2.5 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2.5 rounded-lg border transition-colors ${
                showFilters || hasActiveFilters 
                  ? 'bg-pink-500 text-white border-pink-500' 
                  : 'bg-secondary border-border hover:bg-secondary/80'
              }`}
            >
              <Filter className="w-5 h-5" />
            </button>
            <button
              onClick={handleSearch}
              className="px-4 py-2.5 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
            >
              Suchen
            </button>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-border grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5 flex items-center gap-1">
                  <MapPin className="w-4 h-4" /> Ort
                </label>
                <input
                  type="text"
                  value={filters.location}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                  placeholder="z.B. Bahnhof, Edeka..."
                  className="w-full px-3 py-2 bg-secondary border border-border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 flex items-center gap-1">
                  <Calendar className="w-4 h-4" /> Von Datum
                </label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                  className="w-full px-3 py-2 bg-secondary border border-border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 flex items-center gap-1">
                  <Calendar className="w-4 h-4" /> Bis Datum
                </label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                  className="w-full px-3 py-2 bg-secondary border border-border rounded-lg"
                />
              </div>
              {hasActiveFilters && (
                <div className="md:col-span-3">
                  <button onClick={clearFilters} className="text-sm text-pink-500 hover:underline">
                    Filter zurücksetzen
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="news-card p-4 mb-6 bg-pink-500/5 border-pink-500/20">
          <p className="text-sm text-muted-foreground">
            💕 Spotted ist deine Chance, jemanden wiederzufinden! Beschreibe die Person, 
            wann und wo du sie gesehen hast. Vielleicht liest sie es ja! Alles 100% anonym.
          </p>
        </div>

        {/* Posts List */}
        <div className="space-y-4">
          {isLoading ? (
            <>
              <NewsCardSkeleton />
              <NewsCardSkeleton />
              <NewsCardSkeleton />
            </>
          ) : posts.length > 0 ? (
            posts.map((post) => (
              <SpottedCard key={post.id} spotted={post} />
            ))
          ) : (
            <div className="news-card p-8 text-center">
              <Heart className="w-12 h-12 mx-auto mb-4 text-pink-500/50" />
              <p className="text-muted-foreground mb-4">
                {hasActiveFilters ? 'Keine Posts gefunden.' : 'Noch keine Spotted-Posts vorhanden.'}
              </p>
              {!hasActiveFilters && (
                <button onClick={handleCreateClick} className="btn-primary bg-pink-500">
                  Ersten Spotted-Post erstellen
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
          
          <div className="relative glass-card w-full max-w-lg p-6 animate-scale-in max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-secondary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-pink-500/20 flex items-center justify-center">
                <Heart className="w-6 h-6 text-pink-500" />
              </div>
              <div>
                <h2 className="font-display text-xl font-bold">Neuer Spotted-Post</h2>
                <p className="text-sm text-muted-foreground">Beschreibe wen du gesehen hast</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Titel *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="z.B. 'An die brünette Frau bei Edeka...'"
                  className="input-field"
                  maxLength={100}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Beschreibung *</label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="Beschreibe die Person und die Situation..."
                  rows={4}
                  className="input-field resize-none"
                  maxLength={1000}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-1">
                    <MapPin className="w-4 h-4" /> Ort
                  </label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="z.B. Edeka, Bahnhof..."
                    className="input-field"
                    maxLength={100}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-1">
                    <Calendar className="w-4 h-4" /> Datum
                  </label>
                  <input
                    type="date"
                    value={form.spotted_date}
                    onChange={(e) => setForm({ ...form, spotted_date: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-1">
                  <Clock className="w-4 h-4" /> Uhrzeit (ca.)
                </label>
                <input
                  type="text"
                  value={form.spotted_time}
                  onChange={(e) => setForm({ ...form, spotted_time: e.target.value })}
                  placeholder="z.B. 14:30 Uhr"
                  className="input-field"
                  maxLength={20}
                />
              </div>

              {/* Media Upload */}
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-1">
                  <Image className="w-4 h-4" /> Fotos/Videos (optional, max. 5)
                </label>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleMediaUpload}
                  disabled={isUploadingMedia || mediaFiles.length >= 5}
                  className="hidden"
                  id="spotted-media-upload"
                  multiple
                />
                <label
                  htmlFor="spotted-media-upload"
                  className={`flex items-center justify-center gap-2 w-full px-4 py-3 bg-secondary border-2 border-dashed border-border rounded-xl cursor-pointer hover:bg-secondary/80 hover:border-pink-500/50 transition-all ${isUploadingMedia || mediaFiles.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isUploadingMedia ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin text-pink-500" />
                      <span className="text-muted-foreground">Wird hochgeladen...</span>
                    </>
                  ) : (
                    <>
                      <Image className="w-5 h-5 text-muted-foreground" />
                      <Video className="w-5 h-5 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {mediaFiles.length > 0 ? 'Weitere hinzufügen' : 'Foto/Video hochladen'}
                      </span>
                    </>
                  )}
                </label>

                {/* Media Preview */}
                {mediaFiles.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {mediaFiles.map((media) => (
                      <div key={media.id} className="flex gap-2 p-2 bg-secondary/50 rounded-lg border border-border">
                        <div className="relative w-16 h-16 flex-shrink-0 rounded overflow-hidden">
                          {media.type === 'image' ? (
                            <img src={media.url} alt="Vorschau" className="w-full h-full object-cover" />
                          ) : (
                            <video src={media.url} className="w-full h-full object-cover" />
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveMedia(media.id)}
                            className="absolute top-0.5 right-0.5 p-0.5 bg-black/70 rounded-full"
                          >
                            <X className="w-3 h-3 text-white" />
                          </button>
                        </div>
                        <input
                          type="text"
                          value={media.description}
                          onChange={(e) => handleUpdateMediaDescription(media.id, e.target.value)}
                          placeholder="Was ist zu sehen?"
                          className="flex-1 px-2 py-1 bg-secondary border border-border rounded text-sm"
                        />
                      </div>
                    ))}
                    <p className="text-xs text-amber-400 flex items-start gap-1">
                      <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                      Medien werden von Admins separat geprüft.
                    </p>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !form.title.trim() || !form.content.trim()}
                className="w-full btn-primary bg-pink-500 hover:bg-pink-600 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Heart className="w-5 h-5" />
                    Spotted posten
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => handleAuthModalClose()}
        onContinueAnonymous={() => handleAuthModalClose('anonymous')}
        showAnonymousOption={true}
      />
    </MainLayout>
  );
};

export default SpottedPage;
