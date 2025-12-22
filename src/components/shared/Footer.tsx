import { Link } from "react-router-dom";
import { Phone, Mail, Heart } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-card border-t border-border mt-12">
      {/* Help Hotline */}
      <div className="bg-primary/10 border-b border-border py-3">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-2 text-sm">
            <Heart className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">Brauchst du Hilfe?</span>
            <a 
              href="tel:0800-1110111" 
              className="text-primary font-medium hover:underline flex items-center gap-1"
            >
              <Phone className="w-4 h-4" />
              0800-111 0 111
            </a>
            <span className="text-muted-foreground">(TelefonSeelsorge - 24/7 kostenlos)</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className="font-display text-xl font-bold mb-3">
              <span className="text-primary">Stade</span> News
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Deine Stadt. Deine Storys. Anonym & Echt.
            </p>
            <a 
              href="mailto:Stade.news@web.de"
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <Mail className="w-4 h-4" />
              Stade.news@web.de
            </a>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-semibold mb-3">Navigation</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">Startseite</Link></li>
              <li><Link to="/news" className="text-muted-foreground hover:text-foreground transition-colors">Alle News</Link></li>
              <li><Link to="/kategorien" className="text-muted-foreground hover:text-foreground transition-colors">Kategorien</Link></li>
              <li><Link to="/senden" className="text-muted-foreground hover:text-foreground transition-colors">Story einsenden</Link></li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4 className="font-semibold mb-3">Community</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/chat" className="text-muted-foreground hover:text-foreground transition-colors">Chat</Link></li>
              <li><Link to="/gruppen" className="text-muted-foreground hover:text-foreground transition-colors">Gruppen</Link></li>
              <li><Link to="/ueber-uns" className="text-muted-foreground hover:text-foreground transition-colors">Über uns</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-3">Rechtliches</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/impressum" className="text-muted-foreground hover:text-foreground transition-colors">Impressum</Link></li>
              <li><Link to="/datenschutz" className="text-muted-foreground hover:text-foreground transition-colors">Datenschutz</Link></li>
              <li><Link to="/agb" className="text-muted-foreground hover:text-foreground transition-colors">AGB</Link></li>
              <li><Link to="/cookies" className="text-muted-foreground hover:text-foreground transition-colors">Cookie-Richtlinie</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-6 text-center text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Stade News. Alle Rechte vorbehalten.</p>
        </div>
      </div>
    </footer>
  );
};
