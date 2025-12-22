import { useState, useEffect } from 'react';
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
import { Plus, Heart, MapPin, Calendar, Clock, X, Loader2 } from 'lucide-react';
import type { Spotted } from '@/types/spotted';

const SpottedPage = () => {
  const { user } = useAuth();
  const { anonymousId } = useAnonymousId();
  const { preferAnonymous, savePreference } = useAnonymousPreference();
  const { toast } = useToast();
  const [posts, setPosts] = useState<Spotted[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '',
    content: '',
    location: '',
    spotted_date: '',
    spotted_time: ''
  });

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const data = await fetchSpottedPosts();
      setPosts(data);
    } catch (error) {
      console.error('Error loading spotted posts:', error);
      toast({ title: "Fehler", description: "Posts konnten nicht geladen werden.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.title.trim() || !form.content.trim()) {
      toast({ title: "Fehler", description: "Titel und Beschreibung sind erforderlich.", variant: "destructive" });
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
        anonymous_author: isAnonymous ? generateNickname() : undefined
      });

      toast({ title: "Spotted gepostet!" });
      setShowCreateModal(false);
      setForm({ title: '', content: '', location: '', spotted_date: '', spotted_time: '' });
      loadPosts();
    } catch (error) {
      console.error('Error creating spotted:', error);
      toast({ title: "Fehler", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
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
              <p className="text-muted-foreground mb-4">Noch keine Spotted-Posts vorhanden.</p>
              <button onClick={handleCreateClick} className="btn-primary bg-pink-500">
                Ersten Spotted-Post erstellen
              </button>
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
