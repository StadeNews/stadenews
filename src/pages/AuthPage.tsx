import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Mail, Lock, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import stadeNewsLogo from "@/assets/stade-news-logo.png";

const AuthPage = () => {
  const navigate = useNavigate();
  const { user, signIn, signUp } = useAuth();
  const { toast } = useToast();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', username: '' });

  useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        const { error } = await signUp(form.email, form.password, form.username);
        if (error) {
          toast({ title: 'Fehler', description: error.message, variant: 'destructive' });
        } else {
          toast({ title: 'Erfolgreich registriert!' });
          navigate('/');
        }
      } else {
        const { error } = await signIn(form.email, form.password);
        if (error) {
          toast({ title: 'Fehler', description: 'Ungültige Anmeldedaten.', variant: 'destructive' });
        } else {
          navigate('/');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="glass-card w-full max-w-md p-8">
        <div className="text-center mb-8">
          <img src={stadeNewsLogo} alt="Stade News" className="w-16 h-16 mx-auto rounded-xl mb-4" />
          <h1 className="font-display text-2xl font-bold">{isSignUp ? 'Registrieren' : 'Anmelden'}</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                placeholder="Username"
                className="w-full pl-10 pr-4 py-3 bg-secondary border border-border rounded-xl"
              />
            </div>
          )}
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="E-Mail"
              className="w-full pl-10 pr-4 py-3 bg-secondary border border-border rounded-xl"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Passwort"
              className="w-full pl-10 pr-4 py-3 bg-secondary border border-border rounded-xl"
            />
          </div>
          <button type="submit" disabled={isLoading} className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-medium disabled:opacity-50">
            {isLoading ? 'Laden...' : isSignUp ? 'Registrieren' : 'Anmelden'}
          </button>
        </form>

        <button onClick={() => setIsSignUp(!isSignUp)} className="w-full mt-4 text-sm text-muted-foreground hover:text-foreground">
          {isSignUp ? 'Bereits registriert? Anmelden' : 'Neu hier? Registrieren'}
        </button>
      </div>
    </div>
  );
};

export default AuthPage;
