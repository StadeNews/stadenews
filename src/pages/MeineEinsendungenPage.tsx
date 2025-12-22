import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useAuth } from "@/hooks/useAuth";
import { fetchUserStories } from "@/lib/api";
import { Link, useNavigate } from "react-router-dom";
import { Clock, Check, X, Eye, Send } from "lucide-react";
import type { Story } from "@/types/database";

const MeineEinsendungenPage = () => {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }

    if (user) {
      fetchUserStories(user.id)
        .then(setStories)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user, authLoading, navigate]);

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'published':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/20 text-green-600 text-xs font-medium">
            <Check className="w-3 h-3" />
            Veröffentlicht
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-destructive/20 text-destructive text-xs font-medium">
            <X className="w-3 h-3" />
            Abgelehnt
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/20 text-amber-600 text-xs font-medium">
            <Clock className="w-3 h-3" />
            In Prüfung
          </span>
        );
    }
  };

  if (authLoading || loading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-4 h-24" />
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="font-display text-2xl font-bold text-foreground">Meine Einsendungen</h1>
            <Link
              to="/senden"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Send className="w-4 h-4" />
              Neue Story
            </Link>
          </div>

          {stories.length === 0 ? (
            <div className="text-center py-12 bg-card border border-border rounded-xl">
              <Send className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-foreground mb-2">Noch keine Einsendungen</h2>
              <p className="text-muted-foreground mb-4">Du hast noch keine Stories eingereicht.</p>
              <Link
                to="/senden"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                <Send className="w-4 h-4" />
                Jetzt Story senden
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {stories.map((story) => (
                <div
                  key={story.id}
                  className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusBadge(story.status)}
                        {story.category && (
                          <span className="text-xs text-muted-foreground">
                            {story.category.icon} {story.category.name}
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-foreground truncate">
                        {story.title || 'Ohne Titel'}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {story.content}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(story.created_at).toLocaleDateString('de-DE', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    {story.status === 'published' && (
                      <Link
                        to={`/story/${story.id}`}
                        className="flex items-center gap-1 px-3 py-1.5 bg-secondary text-foreground rounded-lg text-sm hover:bg-secondary/80 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        Ansehen
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default MeineEinsendungenPage;
