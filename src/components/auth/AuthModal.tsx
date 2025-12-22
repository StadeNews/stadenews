import { useState } from 'react';
import { X, Mail, Lock, User, Sun, Moon } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
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
  const { theme, setTheme } = useTheme();
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
      
      <div className="relative bg-card border border-border w-full max-w-md p-8 rounded-xl shadow-xl animate-scale-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-secondary transition-colors"
          aria-label="Schließen"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="font-display text-2xl font-bold mb-2 text-headline">{title}</h2>
        <p className="text-muted-foreground text-sm mb-6">Melde dich an, um alle Funktionen zu nutzen.</p>

        {/* Theme Selection */}
        <div className="mb-6 p-4 bg-secondary/50 rounded-lg">
          <p className="text-sm font-medium mb-3">Anzeigemodus wählen:</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all min-h-[48px] ${
                theme === 'light' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-background border border-border hover:bg-secondary'
              }`}
            >
              <Sun className="w-5 h-5" />
              Hell
            </button>
            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all min-h-[48px] ${
                theme === 'dark' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-background border border-border hover:bg-secondary'
              }`}
            >
              <Moon className="w-5 h-5" />
              Dunkel
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-sm font-semibold mb-2">Benutzername</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  placeholder="Dein Benutzername"
                  className="input-field pl-12"
                />
              </div>
              {errors.username && <p className="text-xs text-destructive mt-1">{errors.username}</p>}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold mb-2">E-Mail</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="deine@email.de"
                className="input-field pl-12"
              />
            </div>
            {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Passwort</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                className="input-field pl-12"
              />
            </div>
            {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full"
          >
            {isLoading ? 'Laden...' : isSignUp ? 'Registrieren' : 'Anmelden'}
          </button>
        </form>

        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="w-full mt-4 py-3 text-sm text-muted-foreground hover:text-foreground transition-colors min-h-[44px]"
        >
          {isSignUp ? 'Bereits registriert? Anmelden' : 'Neu hier? Jetzt registrieren'}
        </button>

        {showAnonymousOption && onContinueAnonymous && (
          <>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-3 text-muted-foreground">oder</span>
              </div>
            </div>

            <button
              onClick={handleAnonymous}
              className="btn-secondary w-full"
            >
              Anonym fortfahren
            </button>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Du erhältst eine anonyme ID, die du für zukünftige Logins speichern kannst.
            </p>
          </>
        )}
      </div>
    </div>
  );
};