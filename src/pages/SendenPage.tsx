import { useState, useEffect, useRef } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useToast } from "@/hooks/use-toast";
import { Send, Check, AlertCircle, Info, Clock, Instagram, Plus, FileText, Sparkles, Loader2, Image, Video, X, Eye } from "lucide-react";
import { fetchCategories, submitStory, createCategory } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { AuthModal } from "@/components/auth/AuthModal";
import { generateNickname } from "@/hooks/useAnonymousId";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { EmojiPicker } from "@/components/shared/EmojiPicker";
import { StoryPreviewModal } from "@/components/shared/StoryPreviewModal";
import type { Category } from "@/types/database";

interface MediaFile {
  id: string;
  url: string;
  type: 'image' | 'video';
  description: string;
}

const SendenPage = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryIcon, setNewCategoryIcon] = useState("📝");
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [isImprovingText, setIsImprovingText] = useState(false);
  const [aiClarification, setAiClarification] = useState<string | null>(null);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
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
        icon: newCategoryIcon,
        color: "#6366f1",
        slug: newCategoryName.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      });
      setCategories([...categories, newCat]);
      setForm({ ...form, category: newCat.id });
      setNewCategoryName("");
      setNewCategoryIcon("📝");
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

  const handleImproveText = async () => {
    if (!form.story.trim() || form.story.length < 20) {
      toast({ title: "Hinweis", description: "Schreibe erst mehr Text, bevor du ihn verbessern lässt.", variant: "default" });
      return;
    }

    setIsImprovingText(true);
    setAiClarification(null);

    try {
      const { data, error } = await supabase.functions.invoke('improve-text', {
        body: { text: form.story, type: 'story' }
      });

      if (error) {
        console.error('Error improving text:', error);
        if (error.message?.includes('429') || error.message?.includes('rate')) {
          toast({ title: "Zu viele Anfragen", description: "Bitte warte kurz und versuche es erneut.", variant: "destructive" });
        } else {
          toast({ title: "Fehler", description: "Text konnte nicht verbessert werden.", variant: "destructive" });
        }
        return;
      }

      if (data?.improved_text) {
        setForm({ ...form, story: data.improved_text });
        toast({ title: "Text verbessert!", description: "Rechtschreibung und Grammatik wurden korrigiert." });
        
        if (data?.clarification_needed) {
          setAiClarification(data.clarification_needed);
        }
      }
    } catch (error) {
      console.error('Error improving text:', error);
      toast({ title: "Fehler", variant: "destructive" });
    } finally {
      setIsImprovingText(false);
    }
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Check max files limit
    if (mediaFiles.length + files.length > 10) {
      toast({ title: "Zu viele Dateien", description: "Maximal 10 Bilder/Videos erlaubt.", variant: "destructive" });
      return;
    }

    setIsUploadingMedia(true);

    try {
      for (const file of Array.from(files)) {
        // Validate file type
        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');
        
        if (!isImage && !isVideo) {
          toast({ title: "Fehler", description: `${file.name}: Nur Bilder und Videos sind erlaubt.`, variant: "destructive" });
          continue;
        }

        // Validate file size (max 50MB for videos, 10MB for images)
        const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
        if (file.size > maxSize) {
          toast({ 
            title: "Datei zu groß", 
            description: `${file.name}: ${isVideo ? "Videos max. 50MB" : "Bilder max. 10MB"}.`, 
            variant: "destructive" 
          });
          continue;
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `stories/${fileName}`;

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

      toast({ title: "Hochgeladen", description: "Bitte beschreibe kurz, was auf den Medien zu sehen ist." });
    } catch (error) {
      console.error('Error uploading media:', error);
      toast({ title: "Upload fehlgeschlagen", description: "Bitte versuche es erneut.", variant: "destructive" });
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

  const handleShowPreview = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.category || !form.story) {
      toast({
        title: "Fehler",
        description: "Bitte wähle eine Kategorie und schreibe deine Story.",
        variant: "destructive",
      });
      return;
    }

    // Check if all media have descriptions
    const missingDescriptions = mediaFiles.filter(m => !m.description.trim());
    if (missingDescriptions.length > 0) {
      toast({
        title: "Beschreibung fehlt",
        description: "Bitte beschreibe alle hochgeladenen Medien.",
        variant: "destructive",
      });
      return;
    }

    setShowPreviewModal(true);
  };

  const handleSubmit = async () => {
    // Show auth modal if not logged in
    if (!user) {
      setShowPreviewModal(false);
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
      // First, create the story
      const { data: storyData, error: storyError } = await supabase
        .from('stories')
        .insert({
          category_id: form.category,
          title: form.title || null,
          content: form.story,
          user_id: asAnonymous ? null : user?.id,
          anonymous_author: asAnonymous ? authorName : (user ? null : authorName),
          social_media_suitable: form.socialMediaSuitable,
          credits_name: form.creditsName.trim() || null,
        })
        .select('id')
        .single();

      if (storyError) throw storyError;

      // Then, insert media files if any
      if (mediaFiles.length > 0 && storyData) {
        const mediaInserts = mediaFiles.map(m => ({
          story_id: storyData.id,
          media_url: m.url,
          media_type: m.type,
          media_description: m.description.trim(),
          media_status: 'pending' as const,
        }));

        const { error: mediaError } = await supabase
          .from('story_media')
          .insert(mediaInserts);

        if (mediaError) {
          console.error('Error inserting media:', mediaError);
        }
      }
      
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
            hasMedia: mediaFiles.length > 0,
            mediaCount: mediaFiles.length,
          }
        });
      } catch (emailError) {
        console.error('Email notification failed:', emailError);
      }
      
      setShowPreviewModal(false);
      setIsSuccess(true);
      toast({
        title: "Story eingereicht! ✓",
        description: mediaFiles.length > 0 
          ? "Deine Story wird geprüft. Bilder/Videos werden separat überprüft."
          : "Deine Story wird geprüft und bald veröffentlicht.",
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
  };

  const handleReset = () => {
    setForm({ category: "", title: "", story: "", socialMediaSuitable: false, creditsName: "" });
    setMediaFiles([]);
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
              
              {mediaFiles.length > 0 && (
                <div className="flex items-start gap-3 mb-4">
                  <Image className="w-5 h-5 text-amber-500 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-foreground">Medien-Überprüfung</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {mediaFiles.length} Bild(er)/Video(s) werden separat geprüft und können unabhängig vom Text abgelehnt werden.
                    </p>
                  </div>
                </div>
              )}
              
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
          <form onSubmit={handleShowPreview} className="space-y-6">
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
                  <div className="flex gap-2 items-start">
                    <EmojiPicker
                      selectedEmoji={newCategoryIcon}
                      onSelect={setNewCategoryIcon}
                    />
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="Name der Kategorie..."
                      className="flex-1 px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                    <button
                      type="button"
                      onClick={handleCreateCategory}
                      disabled={isCreatingCategory || !newCategoryName.trim()}
                      className="px-4 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
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
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-foreground">
                  Deine Story <span className="text-destructive">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleImproveText}
                  disabled={isImprovingText || form.story.length < 20}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400 rounded-lg hover:from-purple-500/30 hover:to-pink-500/30 disabled:opacity-50 transition-all"
                >
                  {isImprovingText ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  KI verbessern
                </button>
              </div>
              <textarea
                value={form.story}
                onChange={(e) => { setForm({ ...form, story: e.target.value }); setAiClarification(null); }}
                placeholder="Was ist passiert? Erzähl uns deine Geschichte..."
                rows={8}
                className="w-full px-4 py-3 bg-secondary border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-y min-h-[150px]"
              />
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-muted-foreground">
                  {form.story.length} Zeichen
                </p>
                {form.story.length >= 20 && (
                  <p className="text-xs text-purple-400">
                    ✨ KI kann Rechtschreibung & Grammatik verbessern
                  </p>
                )}
              </div>
              
              {/* AI Clarification */}
              {aiClarification && (
                <div className="mt-3 p-3 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                  <p className="text-sm text-purple-300 flex items-start gap-2">
                    <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span><strong>Hinweis der KI:</strong> {aiClarification}</span>
                  </p>
                </div>
              )}
            </div>

            {/* Media Upload */}
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">
                Bilder oder Videos <span className="text-muted-foreground">(optional, max. 10)</span>
              </label>
              
              {/* Upload Button */}
              <div className="relative mb-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleMediaUpload}
                  disabled={isUploadingMedia || mediaFiles.length >= 10}
                  className="hidden"
                  id="media-upload"
                  multiple
                />
                <label
                  htmlFor="media-upload"
                  className={`flex items-center justify-center gap-3 w-full px-4 py-6 bg-secondary border-2 border-dashed border-border rounded-xl cursor-pointer hover:bg-secondary/80 hover:border-primary/50 transition-all ${isUploadingMedia || mediaFiles.length >= 10 ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isUploadingMedia ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      <span className="text-muted-foreground">Wird hochgeladen...</span>
                    </>
                  ) : (
                    <>
                      <div className="flex gap-2">
                        <Image className="w-6 h-6 text-muted-foreground" />
                        <Video className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <span className="text-muted-foreground">
                        {mediaFiles.length > 0 ? 'Weitere Dateien hinzufügen' : 'Bilder oder Videos hochladen'}
                      </span>
                    </>
                  )}
                </label>
                <p className="text-xs text-muted-foreground mt-2">
                  Bilder max. 10MB, Videos max. 50MB • {mediaFiles.length}/10 Dateien
                </p>
              </div>

              {/* Media Preview Grid */}
              {mediaFiles.length > 0 && (
                <div className="space-y-3">
                  {mediaFiles.map((media) => (
                    <div key={media.id} className="bg-secondary/50 rounded-xl p-3 border border-border">
                      <div className="flex gap-3">
                        {/* Thumbnail */}
                        <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-secondary">
                          {media.type === 'image' ? (
                            <img 
                              src={media.url} 
                              alt="Vorschau" 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <video 
                              src={media.url} 
                              className="w-full h-full object-cover"
                            />
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveMedia(media.id)}
                            className="absolute top-1 right-1 p-1 bg-black/70 rounded-full hover:bg-black/90 transition-colors"
                          >
                            <X className="w-3 h-3 text-white" />
                          </button>
                          <div className="absolute bottom-1 left-1">
                            {media.type === 'image' ? (
                              <Image className="w-4 h-4 text-white drop-shadow" />
                            ) : (
                              <Video className="w-4 h-4 text-white drop-shadow" />
                            )}
                          </div>
                        </div>
                        
                        {/* Description Input */}
                        <div className="flex-1">
                          <input
                            type="text"
                            value={media.description}
                            onChange={(e) => handleUpdateMediaDescription(media.id, e.target.value)}
                            placeholder="Was ist darauf zu sehen?"
                            className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Beschreibung für Admin-Prüfung
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <p className="text-xs text-amber-400 flex items-start gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                    Jedes Medium wird separat von Admins geprüft und kann einzeln abgelehnt werden.
                  </p>
                </div>
              )}
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

            {/* Submit - now shows preview first */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Eye className="w-5 h-5" />
              Vorschau anzeigen
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

      <StoryPreviewModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        form={form}
        categories={categories}
        mediaFiles={mediaFiles}
      />

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
