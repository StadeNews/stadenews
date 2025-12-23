import { MainLayout } from "@/components/layout/MainLayout";
import { Target, Shield, Smartphone, Instagram } from "lucide-react";

const UeberUnsPage = () => {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="font-display text-4xl font-bold mb-4">Was ist Stade News?</h1>
            <p className="text-xl text-muted-foreground">
              Die anonyme Community-Plattform für deine Stadt
            </p>
          </div>

          {/* Intro Text */}
          <div className="glass-card p-6 md:p-8 mb-8">
            <p className="text-lg leading-relaxed text-muted-foreground">
              <span className="text-primary font-semibold">Stade News</span> ist ein privates Community-Projekt, 
              das lokale Geschichten und News aus Stade sammelt und teilt. Wir sind{" "}
              <span className="text-foreground font-medium">kein offizielles Nachrichtenmedium</span>, 
              sondern eine Plattform von Stadern für Stader – mit Fokus auf Spaß, Austausch und 
              das, was in unserer Stadt wirklich passiert.
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-6">
            {/* Ziel */}
            <div className="glass-card p-6 hover-lift">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-semibold mb-2">Ziel der Plattform</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Wir wollen eine Plattform schaffen, auf der jeder aus Stade seine Geschichten, 
                    Beobachtungen und Meinungen teilen kann – ohne Angst vor Konsequenzen. 
                    Ob Gossip, Lob, Kritik oder einfach nur eine lustige Beobachtung: 
                    Hier hat jede Story ihren Platz.
                  </p>
                </div>
              </div>
            </div>

            {/* Anonymität */}
            <div className="glass-card p-6 hover-lift">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-success" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-semibold mb-2">Anonymität & Sicherheit</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Deine Anonymität ist uns heilig. Wir speichern keine persönlichen Daten, 
                    verlangen keine Registrierung und tracken keine IP-Adressen. 
                    Deine Story bleibt dein Geheimnis – wir veröffentlichen nur den Inhalt, 
                    niemals die Quelle.
                  </p>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="glass-card p-6 hover-lift">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <Smartphone className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-semibold mb-2">Social Media & KI-Clips</h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Die besten Storys werden von uns zu kurzen, unterhaltsamen KI-Videos 
                    aufbereitet und auf TikTok sowie Instagram geteilt. So erreichen wir 
                    noch mehr Menschen in Stade und Umgebung – natürlich weiterhin 100% anonym.
                  </p>
                  
                  <div className="flex flex-wrap gap-3">
                    <a
                      href="https://tiktok.com/@stadenews"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                      </svg>
                      <span className="text-sm font-medium">TikTok</span>
                    </a>
                    
                    <a
                      href="https://instagram.com/stadenews"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
                    >
                      <Instagram className="w-5 h-5 text-pink-400" />
                      <span className="text-sm font-medium">Instagram</span>
                    </a>

                    <a
                      href="https://www.facebook.com/share/1BGBEepEAM/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
                    >
                      <svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                      <span className="text-sm font-medium">Facebook</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground glass-card inline-block px-6 py-3 rounded-full">
              Stade News ist ein privates Community-Projekt ohne Gewinnabsicht.
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default UeberUnsPage;
