import { useState } from 'react';
import { X, Copy, Check, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AnonymousIdModalProps {
  isOpen: boolean;
  onClose: () => void;
  anonymousId: string;
  nickname: string;
}

export const AnonymousIdModal = ({ 
  isOpen, 
  onClose, 
  anonymousId,
  nickname 
}: AnonymousIdModalProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(anonymousId);
      setCopied(true);
      toast({ title: "ID kopiert!", description: "Speichere diese ID sicher ab." });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({ title: "Fehler", description: "Konnte nicht kopieren.", variant: "destructive" });
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative glass-card w-full max-w-md p-6 animate-scale-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-secondary transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-warning/20 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-warning" />
          </div>
          <h2 className="font-display text-2xl font-bold mb-2">Deine Anonyme ID</h2>
          <p className="text-muted-foreground text-sm">
            Speichere diese ID! Sie dient als dein dauerhafter Login-Ersatz.
          </p>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-secondary rounded-xl">
            <p className="text-xs text-muted-foreground mb-1">Dein Nickname:</p>
            <p className="font-semibold text-lg">{nickname}</p>
          </div>

          <div className="p-4 bg-secondary rounded-xl">
            <p className="text-xs text-muted-foreground mb-1">Deine Login-ID:</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-sm font-mono text-primary break-all">
                {anonymousId}
              </code>
              <button
                onClick={handleCopy}
                className="p-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors flex-shrink-0"
              >
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-xl">
            <p className="text-xs text-destructive flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Wichtig:</strong> Wenn du diese ID verlierst, kannst du nicht mehr auf dein anonymes Profil zugreifen. Speichere sie jetzt!
              </span>
            </p>
          </div>

          <button
            onClick={handleCopy}
            className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:neon-glow-sm transition-all flex items-center justify-center gap-2"
          >
            <Copy className="w-5 h-5" />
            ID kopieren
          </button>

          <button
            onClick={onClose}
            className="w-full py-3 bg-secondary text-foreground rounded-xl font-medium hover:bg-secondary/80 transition-all"
          >
            Ich habe die ID gespeichert
          </button>
        </div>
      </div>
    </div>
  );
};
