import { useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";

const DatenschutzPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="font-display text-3xl font-bold mb-8 text-headline">Datenschutzerklärung</h1>
        
        <div className="space-y-6">
          <section className="news-card p-6">
            <h2 className="font-display text-xl font-semibold mb-4">1. Datenschutz auf einen Blick</h2>
            <h3 className="font-semibold mb-2 text-foreground">Allgemeine Hinweise</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie unsere Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können.
            </p>
            <p className="text-muted-foreground text-sm leading-relaxed mt-2">
              Stade News legt besonderen Wert auf Datenschutz und bietet die Möglichkeit zur vollständig anonymen Nutzung.
            </p>
          </section>

          <section className="news-card p-6">
            <h2 className="font-display text-xl font-semibold mb-4">2. Verantwortliche Stelle</h2>
            <div className="text-muted-foreground text-sm leading-relaxed space-y-2">
              <p><strong className="text-foreground">Verantwortlich für die Datenverarbeitung:</strong></p>
              <p>Stade News</p>
              <p>21682 Stade, Deutschland</p>
              <p>E-Mail: <a href="mailto:Stade.news@web.de" className="text-primary hover:underline">Stade.news@web.de</a></p>
            </div>
          </section>

          <section className="news-card p-6">
            <h2 className="font-display text-xl font-semibold mb-4">3. Datenerfassung auf dieser Website</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2 text-foreground">Wer ist verantwortlich für die Datenerfassung?</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen Kontaktdaten können Sie dem Abschnitt "Verantwortliche Stelle" entnehmen.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2 text-foreground">Wie erfassen wir Ihre Daten?</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen (z.B. bei der Registrierung oder beim Einsenden einer Story). Andere Daten werden automatisch oder nach Ihrer Einwilligung beim Besuch der Website durch unsere IT-Systeme erfasst (z.B. technische Daten wie Browser und Betriebssystem).
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2 text-foreground">Wofür nutzen wir Ihre Daten?</h3>
                <ul className="text-muted-foreground text-sm space-y-1 list-disc list-inside">
                  <li>Bereitstellung und Verbesserung unserer Dienste</li>
                  <li>Kommunikation mit Ihnen (z.B. Rückfragen zu Stories)</li>
                  <li>Moderation und Sicherheit der Plattform</li>
                  <li>Statistische Auswertungen (anonymisiert)</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="news-card p-6">
            <h2 className="font-display text-xl font-semibold mb-4">4. Anonyme Nutzung</h2>
            <p className="text-muted-foreground text-sm leading-relaxed mb-3">
              Stade News bietet die Möglichkeit zur vollständig anonymen Nutzung:
            </p>
            <ul className="text-muted-foreground text-sm space-y-2 list-disc list-inside">
              <li><strong className="text-foreground">Anonyme ID:</strong> Bei Klick auf "Anonym fortfahren" wird eine zufällige ID generiert, die keine Rückschlüsse auf Ihre Person zulässt.</li>
              <li><strong className="text-foreground">Keine E-Mail erforderlich:</strong> Für die anonyme Nutzung ist keine E-Mail-Adresse notwendig.</li>
              <li><strong className="text-foreground">Minimale Datenspeicherung:</strong> Bei anonymer Nutzung speichern wir nur die technisch notwendigen Daten.</li>
            </ul>
          </section>

          <section className="news-card p-6">
            <h2 className="font-display text-xl font-semibold mb-4">5. Cookies</h2>
            <p className="text-muted-foreground text-sm leading-relaxed mb-3">
              Unsere Website verwendet Cookies. Details finden Sie in unserer <a href="/cookies" className="text-primary hover:underline">Cookie-Richtlinie</a>.
            </p>
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold mb-1 text-foreground">Notwendige Cookies:</h3>
                <p className="text-muted-foreground text-sm">Für Login, Sicherheit und grundlegende Funktionen.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1 text-foreground">Funktionale Cookies:</h3>
                <p className="text-muted-foreground text-sm">Für Einstellungen wie Theme (Hell/Dunkel) und Sprachpräferenzen.</p>
              </div>
            </div>
          </section>

          <section className="news-card p-6">
            <h2 className="font-display text-xl font-semibold mb-4">6. Hosting und Drittanbieter</h2>
            <div className="space-y-3 text-muted-foreground text-sm leading-relaxed">
              <p><strong className="text-foreground">Hosting:</strong> Unsere Website wird bei einem professionellen Hosting-Anbieter in der EU gehostet.</p>
              <p><strong className="text-foreground">Datenbank:</strong> Wir nutzen Supabase für die Datenspeicherung mit Servern in der EU.</p>
              <p><strong className="text-foreground">CDN:</strong> Für schnelle Ladezeiten nutzen wir ein Content Delivery Network.</p>
            </div>
          </section>

          <section className="news-card p-6">
            <h2 className="font-display text-xl font-semibold mb-4">7. Ihre Rechte</h2>
            <p className="text-muted-foreground text-sm leading-relaxed mb-3">
              Sie haben jederzeit folgende Rechte bezüglich Ihrer personenbezogenen Daten:
            </p>
            <ul className="text-muted-foreground text-sm space-y-2 list-disc list-inside">
              <li><strong className="text-foreground">Auskunft:</strong> Sie können Auskunft über Ihre bei uns gespeicherten Daten verlangen.</li>
              <li><strong className="text-foreground">Berichtigung:</strong> Sie können die Berichtigung unrichtiger Daten verlangen.</li>
              <li><strong className="text-foreground">Löschung:</strong> Sie können die Löschung Ihrer Daten verlangen ("Recht auf Vergessenwerden").</li>
              <li><strong className="text-foreground">Einschränkung:</strong> Sie können die Einschränkung der Verarbeitung verlangen.</li>
              <li><strong className="text-foreground">Datenübertragbarkeit:</strong> Sie können Ihre Daten in einem gängigen Format erhalten.</li>
              <li><strong className="text-foreground">Widerspruch:</strong> Sie können der Verarbeitung Ihrer Daten widersprechen.</li>
              <li><strong className="text-foreground">Beschwerde:</strong> Sie haben das Recht, sich bei einer Datenschutz-Aufsichtsbehörde zu beschweren.</li>
            </ul>
          </section>

          <section className="news-card p-6">
            <h2 className="font-display text-xl font-semibold mb-4">8. Datensicherheit</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Wir setzen technische und organisatorische Sicherheitsmaßnahmen ein, um Ihre Daten gegen Manipulation, Verlust, Zerstörung oder Zugriff unberechtigter Personen zu schützen. Unsere Sicherheitsmaßnahmen werden entsprechend der technologischen Entwicklung fortlaufend verbessert.
            </p>
            <ul className="text-muted-foreground text-sm space-y-1 list-disc list-inside mt-3">
              <li>SSL/TLS-Verschlüsselung für alle Datenübertragungen</li>
              <li>Sichere Passwort-Speicherung (Hashing)</li>
              <li>Regelmäßige Sicherheitsupdates</li>
              <li>Zugangskontrolle für sensible Bereiche</li>
            </ul>
          </section>

          <section className="news-card p-6">
            <h2 className="font-display text-xl font-semibold mb-4">9. Speicherdauer</h2>
            <div className="text-muted-foreground text-sm leading-relaxed space-y-2">
              <p><strong className="text-foreground">Kontodaten:</strong> Bis zur Löschung des Kontos oder auf Antrag.</p>
              <p><strong className="text-foreground">Stories und Kommentare:</strong> Solange veröffentlicht, danach auf Antrag löschbar.</p>
              <p><strong className="text-foreground">Chat-Nachrichten:</strong> 90 Tage nach Veröffentlichung.</p>
              <p><strong className="text-foreground">Anonyme IDs:</strong> Bis zur Löschung durch den Nutzer.</p>
            </div>
          </section>

          <section className="news-card p-6">
            <h2 className="font-display text-xl font-semibold mb-4">10. Kontakt für Datenschutzfragen</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Bei Fragen zum Datenschutz oder zur Ausübung Ihrer Rechte wenden Sie sich bitte an:
            </p>
            <p className="text-muted-foreground text-sm mt-2">
              E-Mail: <a href="mailto:Stade.news@web.de" className="text-primary hover:underline">Stade.news@web.de</a>
            </p>
          </section>

          <section className="news-card p-6 bg-muted/30">
            <p className="text-muted-foreground text-sm text-center">
              Stand: Dezember 2024 | Wir behalten uns vor, diese Datenschutzerklärung bei Bedarf anzupassen.
            </p>
          </section>
        </div>
      </div>
    </MainLayout>
  );
};

export default DatenschutzPage;