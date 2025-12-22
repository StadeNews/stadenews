import { useState } from 'react';
import { X, Flag, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useAnonymousId } from '@/hooks/useAnonymousId';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentType: 'story' | 'comment' | 'chat_message' | 'group_message' | 'profile' | 'spotted' | 'spotted_comment';
  contentId: string;
}

const reasons = [
  { value: 'spam', label: 'Spam' },
  { value: 'harassment', label: 'Belästigung / Mobbing' },
  { value: 'hate_speech', label: 'Hassrede' },
  { value: 'misinformation', label: 'Falschinformationen' },
  { value: 'illegal', label: 'Illegaler Inhalt' },
  { value: 'privacy', label: 'Verletzung der Privatsphäre' },
  { value: 'other', label: 'Sonstiges' },
];

export const ReportModal = ({ 
  isOpen, 
  onClose, 
  contentType,
  contentId 
}: ReportModalProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { anonymousId } = useAnonymousId();
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reason) {
      toast({ title: "Fehler", description: "Bitte wähle einen Grund.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('reports')
        .insert({
          content_type: contentType,
          content_id: contentId,
          reason,
          details: details || null,
          reporter_user_id: user?.id || null,
          reporter_anonymous_id: !user ? anonymousId : null,
        });

      if (error) throw error;

      toast({ title: "Gemeldet", description: "Danke für deine Meldung. Wir prüfen sie." });
      onClose();
    } catch (error) {
      console.error('Error submitting report:', error);
      toast({ title: "Fehler", description: "Meldung konnte nicht gesendet werden.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
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

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center">
            <Flag className="w-6 h-6 text-destructive" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold">Inhalt melden</h2>
            <p className="text-sm text-muted-foreground">Warum möchtest du das melden?</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            {reasons.map((r) => (
              <label
                key={r.value}
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                  reason === r.value ? 'bg-primary/20 border-primary' : 'bg-secondary hover:bg-secondary/80'
                } border border-border`}
              >
                <input
                  type="radio"
                  name="reason"
                  value={r.value}
                  checked={reason === r.value}
                  onChange={(e) => setReason(e.target.value)}
                  className="sr-only"
                />
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  reason === r.value ? 'border-primary' : 'border-muted-foreground'
                }`}>
                  {reason === r.value && <div className="w-2 h-2 rounded-full bg-primary" />}
                </div>
                <span className="text-sm">{r.label}</span>
              </label>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Details (optional)</label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Beschreibe das Problem genauer..."
              rows={3}
              className="w-full px-4 py-3 bg-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-destructive text-destructive-foreground rounded-xl font-medium hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Flag className="w-5 h-5" />
            )}
            Melden
          </button>
        </form>
      </div>
    </div>
  );
};
