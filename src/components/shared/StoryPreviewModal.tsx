import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Send, X, Image, Video, Instagram, User } from "lucide-react";
import type { Category } from "@/types/database";

interface StoryPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  form: {
    category: string;
    title: string;
    story: string;
    socialMediaSuitable: boolean;
    creditsName: string;
    mediaUrl?: string;
    mediaType?: string;
    mediaDescription?: string;
  };
  categories: Category[];
}

export const StoryPreviewModal = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  form,
  categories,
}: StoryPreviewModalProps) => {
  const selectedCategory = categories.find(c => c.id === form.category);
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>Vorschau deiner Story</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Category Badge */}
          {selectedCategory && (
            <Badge variant="secondary" className="text-sm">
              {selectedCategory.icon} {selectedCategory.name}
            </Badge>
          )}
          
          {/* Title */}
          {form.title && (
            <h2 className="text-xl font-bold text-foreground">{form.title}</h2>
          )}
          
          {/* Media Preview */}
          {form.mediaUrl && (
            <div className="relative rounded-xl overflow-hidden bg-secondary">
              {form.mediaType === 'image' ? (
                <img 
                  src={form.mediaUrl} 
                  alt="Story Medien" 
                  className="w-full max-h-64 object-cover"
                />
              ) : form.mediaType === 'video' ? (
                <video 
                  src={form.mediaUrl} 
                  controls 
                  className="w-full max-h-64"
                />
              ) : null}
              
              {form.mediaDescription && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-2">
                  <p className="text-xs text-white">
                    <strong>Beschreibung:</strong> {form.mediaDescription}
                  </p>
                </div>
              )}
            </div>
          )}
          
          {/* Story Content */}
          <div className="bg-secondary/50 rounded-xl p-4 border border-border">
            <p className="text-foreground whitespace-pre-wrap leading-relaxed">
              {form.story}
            </p>
          </div>
          
          {/* Meta Info */}
          <div className="flex flex-wrap gap-2">
            {form.socialMediaSuitable && (
              <Badge variant="outline" className="text-pink-400 border-pink-400/50">
                <Instagram className="w-3 h-3 mr-1" />
                Social Media
              </Badge>
            )}
            
            {form.creditsName && (
              <Badge variant="outline" className="text-muted-foreground">
                <User className="w-3 h-3 mr-1" />
                {form.creditsName}
              </Badge>
            )}
            
            {form.mediaUrl && (
              <Badge variant="outline" className="text-amber-400 border-amber-400/50">
                {form.mediaType === 'image' ? (
                  <><Image className="w-3 h-3 mr-1" /> Mit Bild</>
                ) : (
                  <><Video className="w-3 h-3 mr-1" /> Mit Video</>
                )}
              </Badge>
            )}
          </div>
          
          {/* Media Review Notice */}
          {form.mediaUrl && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3">
              <p className="text-sm text-amber-400">
                <strong>Hinweis:</strong> Bilder und Videos werden separat von einem Admin geprüft und können unabhängig vom Text abgelehnt werden.
              </p>
            </div>
          )}
          
          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              <X className="w-4 h-4 mr-2" />
              Bearbeiten
            </Button>
            <Button
              onClick={onSubmit}
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                  Senden...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Absenden
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
