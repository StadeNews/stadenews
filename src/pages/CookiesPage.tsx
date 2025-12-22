import { useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";

const CookiesPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="font-display text-3xl font-bold mb-8 text-headline">Cookie-Richtlinie</h1>
        
        <div className="space-y-6">
          <section className="news-card p-6">
            <h2 className="font-display text-xl font-semibold mb-4">Was sind Cookies?</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Cookies sind kleine Textdateien, die auf Ihrem Gerät (Computer, Tablet, Smartphone) gespeichert werden, wenn Sie unsere Website besuchen. Sie dienen dazu, unsere Website nutzerfreundlicher, effektiver und sicherer zu machen.
            </p>
            <p className="text-muted-foreground text-sm leading-relaxed mt-2">
              Cookies können keine Programme ausführen oder Viren auf Ihr Gerät übertragen. Sie enthalten nur Informationen, die bei Ihrem erneuten Besuch der Website abgerufen werden.
            </p>
          </section>

          <section className="news-card p-6">
            <h2 className="font-display text-xl font-semibold mb-4">Welche Cookies verwenden wir?</h2>
            
            <div className="space-y-4">
              <div className="p-4 bg-muted/30 rounded-lg">
                <h3 className="font-semibold mb-2 text-foreground">🔒 Notwendige Cookies</h3>
                <p className="text-muted-foreground text-sm mb-2">
                  Diese Cookies sind für die Grundfunktionen der Website unbedingt erforderlich und können nicht deaktiviert werden.
                </p>
                <ul className="text-muted-foreground text-sm space-y-1 list-disc list-inside">
                  <li><strong>Authentifizierung:</strong> Speichert Ihre Login-Session, damit Sie angemeldet bleiben.</li>
                  <li><strong>Anonyme ID:</strong> Speichert Ihre anonyme Nutzer-ID für die Wiedererkennung.</li>
                  <li><strong>Sicherheitstoken:</strong> Schützt vor CSRF-Angriffen und anderen Sicherheitsbedrohungen.</li>
                  <li><strong>Cookie-Einwilligung:</strong> Speichert Ihre Cookie-Präferenzen.</li>
                </ul>
                <p className="text-xs text-muted-foreground mt-2">Speicherdauer: Session bis 1 Jahr</p>
              </div>
              
              <div className="p-4 bg-muted/30 rounded-lg">
                <h3 className="font-semibold mb-2 text-foreground">⚙️ Funktionale Cookies</h3>
                <p className="text-muted-foreground text-sm mb-2">
                  Diese Cookies verbessern die Benutzerfreundlichkeit und können deaktiviert werden.
                </p>
                <ul className="text-muted-foreground text-sm space-y-1 list-disc list-inside">
                  <li><strong>Theme-Einstellung:</strong> Speichert Ihre Präferenz für Hell- oder Dunkelmodus.</li>
                  <li><strong>Spracheinstellungen:</strong> Merkt sich Ihre bevorzugte Sprache.</li>
                  <li><strong>Lesepositionen:</strong> Speichert, bis wohin Sie gescrollt haben.</li>
                </ul>
                <p className="text-xs text-muted-foreground mt-2">Speicherdauer: 1 Jahr</p>
              </div>
            </div>
          </section>

          <section className="news-card p-6">
            <h2 className="font-display text-xl font-semibold mb-4">Welche Cookies verwenden wir NICHT?</h2>
            <p className="text-muted-foreground text-sm leading-relaxed mb-3">
              Stade News legt besonderen Wert auf Datenschutz. Wir verzichten bewusst auf:
            </p>
            <ul className="text-muted-foreground text-sm space-y-2 list-disc list-inside">
              <li><strong className="text-foreground">Tracking-Cookies:</strong> Keine Verfolgung Ihres Surfverhaltens über verschiedene Websites.</li>
              <li><strong className="text-foreground">Werbe-Cookies:</strong> Keine personalisierte Werbung oder Werbenetzwerke.</li>
              <li><strong className="text-foreground">Social-Media-Tracking:</strong> Keine automatische Datenübertragung an soziale Netzwerke.</li>
              <li><strong className="text-foreground">Analyse-Dienste Dritter:</strong> Keine Google Analytics oder ähnliche externe Dienste.</li>
            </ul>
          </section>

          <section className="news-card p-6">
            <h2 className="font-display text-xl font-semibold mb-4">Cookie-Laufzeiten</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 font-semibold">Cookie-Typ</th>
                    <th className="text-left py-2 font-semibold">Laufzeit</th>
                    <th className="text-left py-2 font-semibold">Zweck</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b border-border/50">
                    <td className="py-2">Session-Cookie</td>
                    <td className="py-2">Bis Browser geschlossen</td>
                    <td className="py-2">Temporäre Sitzungsdaten</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2">Auth-Token</td>
                    <td className="py-2">7 Tage</td>
                    <td className="py-2">Login-Session</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2">Anonyme ID</td>
                    <td className="py-2">1 Jahr</td>
                    <td className="py-2">Anonyme Wiedererkennung</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2">Theme-Präferenz</td>
                    <td className="py-2">1 Jahr</td>
                    <td className="py-2">Hell/Dunkel-Modus</td>
                  </tr>
                  <tr>
                    <td className="py-2">Cookie-Einwilligung</td>
                    <td className="py-2">1 Jahr</td>
                    <td className="py-2">Ihre Cookie-Wahl</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="news-card p-6">
            <h2 className="font-display text-xl font-semibold mb-4">Cookies verwalten</h2>
            <p className="text-muted-foreground text-sm leading-relaxed mb-3">
              Sie haben verschiedene Möglichkeiten, Cookies zu kontrollieren:
            </p>
            
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold mb-1 text-foreground">Browser-Einstellungen</h3>
                <p className="text-muted-foreground text-sm">
                  Sie können Cookies in Ihren Browsereinstellungen verwalten, blockieren oder löschen. Die Vorgehensweise finden Sie in der Hilfe Ihres Browsers.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-1 text-foreground">Cookie-Banner</h3>
                <p className="text-muted-foreground text-sm">
                  Beim ersten Besuch unserer Website können Sie über den Cookie-Banner Ihre Präferenzen festlegen.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-1 text-foreground">Einwilligung widerrufen</h3>
                <p className="text-muted-foreground text-sm">
                  Um Ihre Cookie-Einwilligung zu widerrufen, löschen Sie die Cookies in Ihrem Browser. Beim nächsten Besuch wird der Cookie-Banner erneut angezeigt.
                </p>
              </div>
            </div>
          </section>

          <section className="news-card p-6">
            <h2 className="font-display text-xl font-semibold mb-4">Auswirkungen der Cookie-Deaktivierung</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Wenn Sie Cookies deaktivieren, können folgende Einschränkungen auftreten:
            </p>
            <ul className="text-muted-foreground text-sm space-y-1 list-disc list-inside mt-2">
              <li>Sie müssen sich bei jedem Besuch neu anmelden</li>
              <li>Ihre Theme-Einstellung wird nicht gespeichert</li>
              <li>Ihre anonyme ID geht verloren</li>
              <li>Einige Funktionen können eingeschränkt sein</li>
            </ul>
          </section>

          <section className="news-card p-6">
            <h2 className="font-display text-xl font-semibold mb-4">Kontakt</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Bei Fragen zu Cookies oder zum Datenschutz wenden Sie sich bitte an:
            </p>
            <p className="text-muted-foreground text-sm mt-2">
              E-Mail: <a href="mailto:Stade.news@web.de" className="text-primary hover:underline">Stade.news@web.de</a>
            </p>
          </section>

          <section className="news-card p-6 bg-muted/30">
            <p className="text-muted-foreground text-sm text-center">
              Stand: Dezember 2024 | Diese Cookie-Richtlinie kann bei Bedarf aktualisiert werden.
            </p>
          </section>
        </div>
      </div>
    </MainLayout>
  );
};

export default CookiesPage;