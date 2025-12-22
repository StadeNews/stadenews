import { useState } from 'react';
import { X, Mail, Lock, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

const emailSchema = z.string().email('Ungültige E-Mail-Adresse');
const passwordSchema = z.string().min(6, 'Mindestens 6 Zeichen');
const usernameSchema = z.string().min(3, 'Mindestens 3 Zeichen').max(20, 'Maximal 20 Zeichen');

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinueAnonymous?: () => void;
  showAnonymousOption?: boolean;
  title?: string;
}

export const AuthModal = ({ 
  isOpen, 
  onClose, 
  onContinueAnonymous,
  showAnonymousOption = true,
  title = "Anmelden oder Anonym weiter"
}: AuthModalProps) => {
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    email: '',
    password: '',
    username: ''
  });
  const [errors, setErrors] = useState<{ email?: string; password?: string; username?: string }>({});

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: typeof errors = {};
    
    const emailResult = emailSchema.safeParse(form.email);
    if (!emailResult.success) {
      newErrors.email = emailResult.error.errors[0].message;
    }
    
    const passwordResult = passwordSchema.safeParse(form.password);
    if (!passwordResult.success) {
      newErrors.password = passwordResult.error.errors[0].message;
    }
    
    if (isSignUp) {
      const usernameResult = usernameSchema.safeParse(form.username);
      if (!usernameResult.success) {
        newErrors.username = usernameResult.error.errors[0].message;
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsLoading(true);
    
    try {
      if (isSignUp) {
        const { error } = await signUp(form.email, form.password, form.username);
        if (error) {
          if (error.message.includes('already registered')) {
            toast({ title: 'Fehler', description: 'Diese E-Mail ist bereits registriert.', variant: 'destructive' });
          } else {
            toast({ title: 'Fehler', description: error.message, variant: 'destructive' });
          }
        } else {
          toast({ title: 'Erfolgreich registriert!', description: 'Du bist jetzt angemeldet.' });
          onClose();
        }
      } else {
        const { error } = await signIn(form.email, form.password);
        if (error) {
          toast({ title: 'Fehler', description: 'Ungültige E-Mail oder Passwort.', variant: 'destructive' });
        } else {
          toast({ title: 'Willkommen zurück!' });
          onClose();
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnonymous = () => {
    onContinueAnonymous?.();
    onClose();
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

        <h2 className="font-display text-2xl font-bold mb-6">{title}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-sm font-medium mb-2">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  placeholder="Dein Username"
                  className="w-full pl-10 pr-4 py-3 bg-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              {errors.username && <p className="text-xs text-destructive mt-1">{errors.username}</p>}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">E-Mail</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="deine@email.de"
                className="w-full pl-10 pr-4 py-3 bg-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Passwort</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:neon-glow-sm transition-all disabled:opacity-50"
          >
            {isLoading ? 'Laden...' : isSignUp ? 'Registrieren' : 'Anmelden'}
          </button>
        </form>

        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="w-full mt-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {isSignUp ? 'Bereits registriert? Anmelden' : 'Neu hier? Registrieren'}
        </button>

        {showAnonymousOption && onContinueAnonymous && (
          <>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">oder</span>
              </div>
            </div>

            <button
              onClick={handleAnonymous}
              className="w-full py-3 bg-secondary text-foreground rounded-xl font-medium hover:bg-secondary/80 transition-all"
            >
              Anonym fortfahren
            </button>
          </>
        )}
      </div>
    </div>
  );
};
