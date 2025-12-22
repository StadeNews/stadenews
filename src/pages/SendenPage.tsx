import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useToast } from "@/hooks/use-toast";
import { Send, Check, AlertCircle, Info } from "lucide-react";

const categories = [
  { id: "blaulicht", name: "🚨 Blaulicht & Verkehr" },
  { id: "gossip", name: "🗣 Stadt-Gossip" },
  { id: "aufreger", name: "⚠️ Aufreger der Woche" },
  { id: "events", name: "🎉 Events & Freizeit" },
  { id: "gestaendnisse", name: "🤐 Anonyme Geständnisse" },
  { id: "lob", name: "❤️ Lob & Feedback" },
];

const SendenPage = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [form, setForm] = useState({
    category: "",
    title: "",
    story: "",
  });

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

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsSuccess(true);
    
    toast({
      title: "Story eingereicht! ✓",
      description: "Deine Story wird geprüft und bald veröffentlicht.",
    });
  };

  const handleReset = () => {
    setForm({ category: "", title: "", story: "" });
    setIsSuccess(false);
  };

  if (isSuccess) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-lg mx-auto text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-success/20 flex items-center justify-center animate-scale-in">
              <Check className="w-10 h-10 text-success" />
            </div>
            
            <h1 className="font-display text-3xl font-bold mb-4">Story eingereicht!</h1>
            <p className="text-muted-foreground mb-8">
              Danke für deinen Beitrag! Wir prüfen deine Story und veröffentlichen sie so schnell wie möglich.
            </p>
            
            <button
              onClick={handleReset}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:neon-glow-sm transition-all"
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
            <h1 className="font-display text-3xl font-bold mb-2">Story einsenden</h1>
            <p className="text-muted-foreground">Teile deine Geschichte – 100% anonym</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Kategorie <span className="text-destructive">*</span>
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-4 py-3 bg-secondary border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              >
                <option value="">Kategorie wählen...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-2">
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
              <label className="block text-sm font-medium mb-2">
                Deine Story <span className="text-destructive">*</span>
              </label>
              <textarea
                value={form.story}
                onChange={(e) => setForm({ ...form, story: e.target.value })}
                placeholder="Was ist passiert? Erzähl uns deine Geschichte..."
                rows={6}
                className="w-full px-4 py-3 bg-secondary border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
              />
              <p className="text-xs text-muted-foreground mt-2">
                {form.story.length} / 2000 Zeichen
              </p>
            </div>

            {/* Info Box */}
            <div className="glass-card p-4 flex gap-3">
              <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                Deine Story wird anonym geprüft und ggf. für KI-Videos auf TikTok & Instagram verwendet.
              </p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-primary text-primary-foreground rounded-xl font-semibold hover:neon-glow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
    </MainLayout>
  );
};

export default SendenPage;
