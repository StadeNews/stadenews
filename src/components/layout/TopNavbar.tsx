import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogIn, LogOut, Shield, User, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { AuthModal } from "@/components/auth/AuthModal";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import stadeNewsLogo from "@/assets/stade-news-logo.png";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/news", label: "News" },
  { href: "/kategorien", label: "Kategorien" },
  { href: "/ueber-uns", label: "Über uns" },
];

export const TopNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, signOut } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border shadow-sm">
        <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-lg overflow-hidden border border-border group-hover:border-primary transition-colors">
              <img src={stadeNewsLogo} alt="Stade News" className="w-full h-full object-cover" />
            </div>
            <div className="hidden sm:block">
              <span className="font-display font-bold text-lg text-headline">
                <span className="text-primary">Stade</span> News
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <ul className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  to={link.href}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200",
                    location.pathname === link.href
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <ThemeToggle className="hidden md:flex" />
            
            {isAdmin && (
              <Link
                to="/admin"
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-destructive/10 text-destructive rounded-lg text-sm font-semibold hover:bg-destructive/20 transition-colors min-h-[44px]"
              >
                <Shield className="w-4 h-4" />
                Admin
              </Link>
            )}
            
            {user ? (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  to="/profil"
                  className="flex items-center gap-2 px-4 py-2 bg-secondary text-foreground rounded-lg text-sm font-semibold hover:bg-secondary/80 transition-colors min-h-[44px]"
                >
                  <User className="w-4 h-4" />
                  Profil
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 p-2 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors min-h-[44px]"
                  aria-label="Abmelden"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="hidden md:flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground rounded-lg font-semibold text-sm hover:bg-primary/90 transition-all duration-200 min-h-[44px]"
              >
                <LogIn className="w-4 h-4" />
                Anmelden
              </button>
            )}

            <Link
              to="/senden"
              className="hidden md:flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground rounded-lg font-semibold text-sm hover:bg-primary/90 transition-all duration-200 min-h-[44px]"
            >
              Story senden
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-secondary transition-colors min-h-[44px]"
              aria-label="Menü öffnen"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </nav>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-card border-t border-border">
            <div className="container mx-auto px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "block px-4 py-3 rounded-lg text-base font-semibold transition-colors min-h-[48px]",
                    location.pathname === link.href
                      ? "bg-primary/10 text-primary"
                      : "text-foreground hover:bg-secondary"
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-2 border-t border-border space-y-2">
                <ThemeToggle showLabel className="w-full justify-center" />
                {!user && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setShowAuthModal(true);
                    }}
                    className="btn-primary w-full"
                  >
                    <LogIn className="w-5 h-5" />
                    Anmelden
                  </button>
                )}
                <Link
                  to="/senden"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-primary w-full"
                >
                  Story senden
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        showAnonymousOption={false}
      />
    </>
  );
};