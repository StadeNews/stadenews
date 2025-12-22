import { Link, useLocation } from "react-router-dom";
import { Newspaper } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/news", label: "News" },
  { href: "/kategorien", label: "Kategorien" },
  { href: "/ueber-uns", label: "Über uns" },
];

export const TopNavbar = () => {
  const location = useLocation();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/30">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link 
          to="/" 
          className="flex items-center gap-3 group"
        >
          <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center group-hover:neon-glow-sm transition-all duration-300">
            <Newspaper className="w-5 h-5 text-primary" />
          </div>
          <span className="font-display font-bold text-lg hidden sm:block">
            Stade News
          </span>
        </Link>

        {/* Desktop Navigation */}
        <ul className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                to={link.href}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  location.pathname === link.href
                    ? "bg-primary/20 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                )}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* CTA Button - Desktop */}
        <Link
          to="/senden"
          className="hidden md:flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:neon-glow-sm transition-all duration-300"
        >
          Story senden
        </Link>
      </nav>
    </header>
  );
};
