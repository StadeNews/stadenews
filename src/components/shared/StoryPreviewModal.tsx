import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Send, X, Image, Video, Instagram, User } from "lucide-react";
import type { Category } from "@/types/database";

interface MediaFile {
  id: string;
  url: string;
  type: 'image' | 'video';
  description: string;
}

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
  };
  categories: Category[];
  mediaFiles?: MediaFile[];
}

export const StoryPreviewModal = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  form,
  categories,
  mediaFiles = [],
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
          
          {/* Media Preview Grid */}
          {mediaFiles.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                {mediaFiles.length} Medien angehängt:
              </p>
              <div className="grid grid-cols-3 gap-2">
                {mediaFiles.map((media) => (
                  <div key={media.id} className="relative rounded-lg overflow-hidden bg-secondary aspect-square">
                    {media.type === 'image' ? (
                      <img 
                        src={media.url} 
                        alt={media.description} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <video 
                        src={media.url} 
                        className="w-full h-full object-cover"
                      />
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-1 py-0.5">
                      <p className="text-[10px] text-white truncate">
                        {media.description || 'Keine Beschreibung'}
                      </p>
                    </div>
                    <div className="absolute top-1 right-1">
                      {media.type === 'image' ? (
                        <Image className="w-3 h-3 text-white drop-shadow" />
                      ) : (
                        <Video className="w-3 h-3 text-white drop-shadow" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
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
            
            {mediaFiles.length > 0 && (
              <Badge variant="outline" className="text-amber-400 border-amber-400/50">
                <Image className="w-3 h-3 mr-1" />
                {mediaFiles.length} {mediaFiles.length === 1 ? 'Medium' : 'Medien'}
              </Badge>
            )}
          </div>
          
          {/* Media Review Notice */}
          {mediaFiles.length > 0 && (
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
