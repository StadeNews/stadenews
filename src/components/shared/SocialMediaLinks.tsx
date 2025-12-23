import { useState } from "react";
import { Instagram, Facebook, ExternalLink, Check, X, Loader2, HelpCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// TikTok icon component
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

interface SocialMediaLinksProps {
  userId: string;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  tiktokUrl?: string | null;
  isOwnProfile?: boolean;
  onUpdate?: () => void;
}

const validateUrl = (url: string, platform: 'instagram' | 'facebook' | 'tiktok'): boolean => {
  if (!url.trim()) return true; // Empty is valid (for removal)
  
  const patterns: Record<string, RegExp> = {
    instagram: /^(https?:\/\/)?(www\.)?instagram\.com\/[a-zA-Z0-9._]+\/?(\?.*)?$/,
    facebook: /^(https?:\/\/)?(www\.)?(facebook\.com|fb\.com)\/.+$/,
    tiktok: /^(https?:\/\/)?(www\.)?tiktok\.com\/@[a-zA-Z0-9._]+\/?(\?.*)?$/,
  };
  
  return patterns[platform].test(url);
};

const formatUrl = (url: string): string => {
  if (!url.trim()) return '';
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }
  return url;
};

export const SocialMediaLinks = ({
  userId,
  instagramUrl,
  facebookUrl,
  tiktokUrl,
  isOwnProfile = false,
  onUpdate
}: SocialMediaLinksProps) => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  
  const [instagram, setInstagram] = useState(instagramUrl || '');
  const [facebook, setFacebook] = useState(facebookUrl || '');
  const [tiktok, setTiktok] = useState(tiktokUrl || '');
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSave = async () => {
    const newErrors: Record<string, string> = {};
    
    if (instagram && !validateUrl(instagram, 'instagram')) {
      newErrors.instagram = 'Ungültiger Instagram-Link (z.B. instagram.com/username)';
    }
    if (facebook && !validateUrl(facebook, 'facebook')) {
      newErrors.facebook = 'Ungültiger Facebook-Link (z.B. facebook.com/username)';
    }
    if (tiktok && !validateUrl(tiktok, 'tiktok')) {
      newErrors.tiktok = 'Ungültiger TikTok-Link (z.B. tiktok.com/@username)';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          instagram_url: formatUrl(instagram) || null,
          facebook_url: formatUrl(facebook) || null,
          tiktok_url: formatUrl(tiktok) || null,
        })
        .eq('id', userId);
      
      if (error) throw error;
      
      toast({ title: "Social Media Links gespeichert!" });
      setIsEditing(false);
      setErrors({});
      onUpdate?.();
    } catch (error) {
      console.error('Error saving social links:', error);
      toast({
        title: "Fehler",
        description: "Links konnten nicht gespeichert werden.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setInstagram(instagramUrl || '');
    setFacebook(facebookUrl || '');
    setTiktok(tiktokUrl || '');
    setErrors({});
    setIsEditing(false);
  };

  // Display mode (for viewing profiles)
  if (!isOwnProfile) {
    const hasLinks = instagramUrl || facebookUrl || tiktokUrl;
    
    if (!hasLinks) return null;
    
    return (
      <div className="flex items-center gap-3">
        {instagramUrl && (
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-lg text-white hover:opacity-90 transition-opacity"
            title="Instagram"
          >
            <Instagram className="w-5 h-5" />
          </a>
        )}
        {facebookUrl && (
          <a
            href={facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 bg-blue-600 rounded-lg text-white hover:opacity-90 transition-opacity"
            title="Facebook"
          >
            <Facebook className="w-5 h-5" />
          </a>
        )}
        {tiktokUrl && (
          <a
            href={tiktokUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 bg-black rounded-lg text-white hover:opacity-90 transition-opacity"
            title="TikTok"
          >
            <TikTokIcon className="w-5 h-5" />
          </a>
        )}
      </div>
    );
  }

  // Edit mode (for own profile)
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground flex items-center gap-2">
          <ExternalLink className="w-4 h-4" />
          Social Media
        </label>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="text-xs text-primary hover:underline"
          >
            Bearbeiten
          </button>
        ) : (
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            <HelpCircle className="w-3 h-3" />
            Hilfe
          </button>
        )}
      </div>

      {showHelp && isEditing && (
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 text-xs text-muted-foreground">
          <p className="font-medium text-foreground mb-1">Link-Format:</p>
          <ul className="space-y-1">
            <li>• Instagram: instagram.com/deinname</li>
            <li>• Facebook: facebook.com/deinname</li>
            <li>• TikTok: tiktok.com/@deinname</li>
          </ul>
        </div>
      )}

      {isEditing ? (
        <div className="space-y-3 bg-secondary/50 rounded-lg p-4">
          {/* Instagram */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded">
                <Instagram className="w-3 h-3 text-white" />
              </div>
              <span className="text-xs text-muted-foreground">Instagram</span>
            </div>
            <input
              type="text"
              value={instagram}
              onChange={(e) => {
                setInstagram(e.target.value);
                setErrors(prev => ({ ...prev, instagram: '' }));
              }}
              placeholder="instagram.com/deinname"
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            {errors.instagram && (
              <p className="text-xs text-destructive mt-1">{errors.instagram}</p>
            )}
          </div>

          {/* Facebook */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1 bg-blue-600 rounded">
                <Facebook className="w-3 h-3 text-white" />
              </div>
              <span className="text-xs text-muted-foreground">Facebook</span>
            </div>
            <input
              type="text"
              value={facebook}
              onChange={(e) => {
                setFacebook(e.target.value);
                setErrors(prev => ({ ...prev, facebook: '' }));
              }}
              placeholder="facebook.com/deinname"
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            {errors.facebook && (
              <p className="text-xs text-destructive mt-1">{errors.facebook}</p>
            )}
          </div>

          {/* TikTok */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1 bg-black rounded">
                <TikTokIcon className="w-3 h-3 text-white" />
              </div>
              <span className="text-xs text-muted-foreground">TikTok</span>
            </div>
            <input
              type="text"
              value={tiktok}
              onChange={(e) => {
                setTiktok(e.target.value);
                setErrors(prev => ({ ...prev, tiktok: '' }));
              }}
              placeholder="tiktok.com/@deinname"
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            {errors.tiktok && (
              <p className="text-xs text-destructive mt-1">{errors.tiktok}</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={handleCancel}
              className="flex-1 px-3 py-2 text-sm text-muted-foreground hover:text-foreground bg-background border border-border rounded-lg"
            >
              <X className="w-4 h-4 inline mr-1" />
              Abbrechen
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 px-3 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 inline mr-1 animate-spin" />
              ) : (
                <Check className="w-4 h-4 inline mr-1" />
              )}
              Speichern
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 bg-secondary/50 rounded-lg p-3">
          {instagramUrl ? (
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-lg text-white hover:opacity-90 transition-opacity"
            >
              <Instagram className="w-4 h-4" />
            </a>
          ) : (
            <div className="p-2 bg-muted rounded-lg text-muted-foreground opacity-50">
              <Instagram className="w-4 h-4" />
            </div>
          )}
          {facebookUrl ? (
            <a
              href={facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-blue-600 rounded-lg text-white hover:opacity-90 transition-opacity"
            >
              <Facebook className="w-4 h-4" />
            </a>
          ) : (
            <div className="p-2 bg-muted rounded-lg text-muted-foreground opacity-50">
              <Facebook className="w-4 h-4" />
            </div>
          )}
          {tiktokUrl ? (
            <a
              href={tiktokUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-black rounded-lg text-white hover:opacity-90 transition-opacity"
            >
              <TikTokIcon className="w-4 h-4" />
            </a>
          ) : (
            <div className="p-2 bg-muted rounded-lg text-muted-foreground opacity-50">
              <TikTokIcon className="w-4 h-4" />
            </div>
          )}
          {!instagramUrl && !facebookUrl && !tiktokUrl && (
            <span className="text-xs text-muted-foreground ml-2">Noch keine Links hinzugefügt</span>
          )}
        </div>
      )}
    </div>
  );
};
