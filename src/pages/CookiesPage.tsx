import { MainLayout } from "@/components/layout/MainLayout";
import { Footer } from "@/components/shared/Footer";

const CookiesPage = () => {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="font-display text-3xl font-bold mb-8">Cookie-Richtlinie</h1>
        
        <div className="prose prose-invert max-w-none space-y-6">
          <section className="glass-card p-6">
            <h2 className="font-display text-xl font-semibold mb-4">Was sind Cookies?</h2>
            <p className="text-muted-foreground text-sm">
              Cookies sind kleine Textdateien, die auf Ihrem Gerät gespeichert werden, wenn Sie unsere Website besuchen.
            </p>
          </section>

          <section className="glass-card p-6">
            <h2 className="font-display text-xl font-semibold mb-4">Welche Cookies verwenden wir?</h2>
            
            <h3 className="font-semibold mb-2">Notwendige Cookies</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Diese Cookies sind für die Grundfunktionen der Website erforderlich:
            </p>
            <ul className="text-muted-foreground text-sm space-y-1 mb-4">
              <li>• Authentifizierung und Login</li>
              <li>• Anonyme ID-Speicherung</li>
              <li>• Sicherheitstoken</li>
            </ul>
            
            <h3 className="font-semibold mb-2">Funktionale Cookies</h3>
            <p className="text-muted-foreground text-sm">
              Diese verbessern die Benutzerfreundlichkeit (z.B. Spracheinstellungen).
            </p>
          </section>

          <section className="glass-card p-6">
            <h2 className="font-display text-xl font-semibold mb-4">Cookies verwalten</h2>
            <p className="text-muted-foreground text-sm">
              Sie können Cookies in Ihren Browsereinstellungen verwalten oder löschen. Beachten Sie, dass einige Funktionen der Website möglicherweise nicht verfügbar sind, wenn Sie Cookies deaktivieren.
            </p>
          </section>

          <section className="glass-card p-6">
            <h2 className="font-display text-xl font-semibold mb-4">Kontakt</h2>
            <p className="text-muted-foreground text-sm">
              Bei Fragen zu Cookies: <a href="mailto:Stade.news@web.de" className="text-primary hover:underline">Stade.news@web.de</a>
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </MainLayout>
  );
};

export default CookiesPage;
