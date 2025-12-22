import { Link } from "react-router-dom";
import { Phone, Mail, Heart, Instagram, Facebook } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-card border-t border-border mt-12">
      {/* Help Hotline */}
      <div className="bg-destructive/5 border-b border-border py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-sm">
            <Heart className="w-5 h-5 text-destructive" />
            <span className="text-foreground font-medium">Brauchst du Hilfe?</span>
            <a 
              href="tel:0800-1110111" 
              className="text-destructive font-bold hover:underline flex items-center gap-1 text-base"
            >
              <Phone className="w-4 h-4" />
              0800-111 0 111
            </a>
            <span className="text-muted-foreground text-xs">(TelefonSeelsorge - 24/7 kostenlos)</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className="font-display text-xl font-bold mb-4 text-headline">
              <span className="text-primary">Stade</span> News
            </h3>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              Deine Stadt. Deine Storys. Anonym & Echt.
            </p>
            <a 
              href="mailto:Stade.news@web.de"
              className="inline-flex items-center gap-2 text-sm text-primary font-semibold hover:underline"
            >
              <Mail className="w-4 h-4" />
              Stade.news@web.de
            </a>
            
            {/* Social Links */}
            <div className="flex gap-3 mt-4">
              <a 
                href="https://www.instagram.com/stadenews" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="https://www.facebook.com/share/1Wq2pNJ5oY/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a 
                href="https://www.tiktok.com/@stadenews" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
                aria-label="TikTok"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Navigation</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/" className="text-muted-foreground hover:text-primary transition-colors">Startseite</Link></li>
              <li><Link to="/news" className="text-muted-foreground hover:text-primary transition-colors">Alle News</Link></li>
              <li><Link to="/kategorien" className="text-muted-foreground hover:text-primary transition-colors">Kategorien</Link></li>
              <li><Link to="/senden" className="text-muted-foreground hover:text-primary transition-colors">Story einsenden</Link></li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Community</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/chat" className="text-muted-foreground hover:text-primary transition-colors">Chat</Link></li>
              <li><Link to="/gruppen" className="text-muted-foreground hover:text-primary transition-colors">Gruppen</Link></li>
              <li><Link to="/status-center" className="text-muted-foreground hover:text-primary transition-colors">Status-Center</Link></li>
              <li><Link to="/ueber-uns" className="text-muted-foreground hover:text-primary transition-colors">Über uns</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Rechtliches</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/impressum" className="text-muted-foreground hover:text-primary transition-colors">Impressum</Link></li>
              <li><Link to="/datenschutz" className="text-muted-foreground hover:text-primary transition-colors">Datenschutz</Link></li>
              <li><Link to="/agb" className="text-muted-foreground hover:text-primary transition-colors">AGB</Link></li>
              <li><Link to="/cookies" className="text-muted-foreground hover:text-primary transition-colors">Cookie-Richtlinie</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-10 pt-6 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Stade News. Alle Rechte vorbehalten.</p>
        </div>
      </div>
    </footer>
  );
};