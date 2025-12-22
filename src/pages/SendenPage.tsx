import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useToast } from "@/hooks/use-toast";
import { Send, Check, AlertCircle, Info, Clock, Instagram, Plus, FileText } from "lucide-react";
import { fetchCategories, submitStory, createCategory } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { AuthModal } from "@/components/auth/AuthModal";
import { generateNickname } from "@/hooks/useAnonymousId";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import type { Category } from "@/types/database";

const SendenPage = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [form, setForm] = useState({
    category: "",
    title: "",
    story: "",
    socialMediaSuitable: false,
    creditsName: "",
  });

  useEffect(() => {
    fetchCategories().then(setCategories).catch(console.error);
  }, []);

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    
    setIsCreatingCategory(true);
    try {
      const newCat = await createCategory({
        name: newCategoryName.trim(),
        icon: "📝",
        color: "#6366f1",
        slug: newCategoryName.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      });
      setCategories([...categories, newCat]);
      setForm({ ...form, category: newCat.id });
      setNewCategoryName("");
      setShowNewCategory(false);
      toast({
        title: "Kategorie erstellt",
        description: `"${newCat.name}" wurde hinzugefügt.`,
      });
    } catch (error) {
      console.error('Error creating category:', error);
      toast({
        title: "Fehler",
        description: "Kategorie konnte nicht erstellt werden.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingCategory(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.category || !form.story) {
      toast({
        title: "Fehler",
        description: "Bitte wähle eine Kategorie und schreibe deine Story.",
        variant: "destructive",
      });
      return;
    }

    // Show auth modal if not logged in - user can choose to login or continue anonymously
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    await submitStoryToDatabase();
  };

  const submitStoryToDatabase = async (asAnonymous = false) => {
    setIsSubmitting(true);
    const authorName = asAnonymous ? generateNickname() : (user ? user.email?.split('@')[0] || 'Unbekannt' : generateNickname());
    const categoryName = categories.find(c => c.id === form.category)?.name || 'Unbekannt';
    
    try {
      await submitStory({
        category_id: form.category,
        title: form.title || undefined,
        content: form.story,
        user_id: asAnonymous ? undefined : user?.id,
        anonymous_author: asAnonymous ? authorName : (user ? undefined : authorName),
        social_media_suitable: form.socialMediaSuitable,
        credits_name: form.creditsName.trim() || undefined,
      });
      
      // Send email notification to admin
      try {
        await supabase.functions.invoke('send-story-notification', {
          body: {
            title: form.title,
            content: form.story,
            category: categoryName,
            authorName: authorName,
            socialMediaSuitable: form.socialMediaSuitable,
            creditsName: form.creditsName.trim() || undefined,
          }
        });
      } catch (emailError) {
        console.error('Email notification failed:', emailError);
        // Don't fail the submission if email fails
      }
      
      setIsSuccess(true);
      toast({
        title: "Story eingereicht! ✓",
        description: "Deine Story wird geprüft und bald veröffentlicht.",
      });
    } catch (error) {
      console.error('Error submitting story:', error);
      toast({
        title: "Fehler",
        description: "Story konnte nicht gesendet werden. Bitte versuche es erneut.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAuthModalClose = (action?: 'login' | 'anonymous') => {
    setShowAuthModal(false);
    if (action === 'anonymous') {
      submitStoryToDatabase(true);
    }
    // If 'login', user will login and can then submit again
  };

  const handleReset = () => {
    setForm({ category: "", title: "", story: "", socialMediaSuitable: false, creditsName: "" });
    setIsSuccess(false);
  };

  if (isSuccess) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-lg mx-auto text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center animate-scale-in">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            
            <h1 className="font-display text-3xl font-bold mb-4 text-foreground">Story eingereicht!</h1>
            
            <div className="bg-card border border-border rounded-xl p-6 mb-6 text-left">
              <div className="flex items-start gap-3 mb-4">
                <Clock className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-semibold text-foreground">Was passiert jetzt?</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Deine Story wird von unseren Moderatoren geprüft. Das dauert in der Regel 1-24 Stunden.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 mb-4">
                <Check className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-foreground">Nach der Freigabe</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Deine Story erscheint auf der News-Seite und kann von der Community gelesen werden.
                  </p>
                </div>
              </div>
              
              {form.socialMediaSuitable && (
                <div className="flex items-start gap-3">
                  <Instagram className="w-5 h-5 text-pink-500 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-foreground">Social Media</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Deine Story könnte auf TikTok, Instagram oder Facebook geteilt werden.
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            <button
              onClick={handleReset}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-all"
            >
              Weitere Story senden
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-lg mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-display text-3xl font-bold mb-2 text-foreground">Story einsenden</h1>
                <p className="text-muted-foreground">Teile deine Geschichte – 100% anonym</p>
              </div>
              {user && (
                <Link
                  to="/meine-einsendungen"
                  className="inline-flex items-center gap-2 px-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground hover:bg-secondary/80 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  Meine Einsendungen
                </Link>
              )}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">
                Kategorie <span className="text-destructive">*</span>
              </label>
              <div className="flex gap-2">
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="flex-1 px-4 py-3 bg-secondary border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                >
                  <option value="">Kategorie wählen...</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowNewCategory(!showNewCategory)}
                  className="px-3 py-3 bg-secondary border border-border rounded-xl text-foreground hover:bg-secondary/80 transition-colors"
                  title="Neue Kategorie erstellen"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              
              {showNewCategory && (
                <div className="mt-3 p-4 bg-card border border-border rounded-xl">
                  <label className="block text-sm font-medium mb-2 text-foreground">
                    Neue Kategorie erstellen
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="Name der Kategorie..."
                      className="flex-1 px-4 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                    <button
                      type="button"
                      onClick={handleCreateCategory}
                      disabled={isCreatingCategory || !newCategoryName.trim()}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                      {isCreatingCategory ? "..." : "Erstellen"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">
                Titel <span className="text-muted-foreground">(optional)</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Eine kurze Überschrift..."
                className="w-full px-4 py-3 bg-secondary border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>

            {/* Story */}
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">
                Deine Story <span className="text-destructive">*</span>
              </label>
              <textarea
                value={form.story}
                onChange={(e) => setForm({ ...form, story: e.target.value })}
                placeholder="Was ist passiert? Erzähl uns deine Geschichte..."
                rows={6}
                maxLength={2000}
                className="w-full px-4 py-3 bg-secondary border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
              />
              <p className="text-xs text-muted-foreground mt-2">
                {form.story.length} / 2000 Zeichen
              </p>
            </div>

            {/* Social Media Checkbox */}
            <div className="bg-card border border-border rounded-xl p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.socialMediaSuitable}
                  onChange={(e) => setForm({ ...form, socialMediaSuitable: e.target.checked })}
                  className="mt-1 w-5 h-5 rounded border-border text-primary focus:ring-primary/50"
                />
                <div>
                  <span className="font-medium text-foreground">Für Social Media geeignet</span>
                  <p className="text-sm text-muted-foreground mt-1">
                    Diese Story darf auf TikTok, Instagram oder Facebook geteilt werden
                  </p>
                </div>
              </label>
            </div>

            {/* Credits Name */}
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">
                Credits / Erwähnung <span className="text-muted-foreground">(optional)</span>
              </label>
              <input
                type="text"
                value={form.creditsName}
                onChange={(e) => setForm({ ...form, creditsName: e.target.value })}
                placeholder="Name oder Social-Media-Handle für die Erwähnung..."
                className="w-full px-4 py-3 bg-secondary border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Falls du nicht anonym bleiben willst, gib hier deinen Namen/Handle ein
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-card border border-border rounded-xl p-4 flex gap-3">
              <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                Deine Story wird anonym geprüft und ggf. für KI-Videos auf TikTok & Instagram verwendet.
              </p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Wird gesendet...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Story absenden
                </>
              )}
            </button>
          </form>

          {/* Privacy Note */}
          <div className="mt-8 flex items-start gap-3 text-xs text-muted-foreground">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p>
              Mit dem Absenden bestätigst du, dass deine Story keine falschen Anschuldigungen oder illegale Inhalte enthält. Wir behalten uns vor, Inhalte nicht zu veröffentlichen.
            </p>
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => handleAuthModalClose()}
        onContinueAnonymous={() => handleAuthModalClose('anonymous')}
        showAnonymousOption={true}
      />
    </MainLayout>
  );
};

export default SendenPage;