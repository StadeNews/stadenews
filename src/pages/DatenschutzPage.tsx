import { MainLayout } from "@/components/layout/MainLayout";
import { Footer } from "@/components/shared/Footer";

const DatenschutzPage = () => {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="font-display text-3xl font-bold mb-8">Datenschutzerklärung</h1>
        
        <div className="prose prose-invert max-w-none space-y-6">
          <section className="glass-card p-6">
            <h2 className="font-display text-xl font-semibold mb-4">1. Datenschutz auf einen Blick</h2>
            <h3 className="font-semibold mb-2">Allgemeine Hinweise</h3>
            <p className="text-muted-foreground text-sm">
              Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen.
            </p>
          </section>

          <section className="glass-card p-6">
            <h2 className="font-display text-xl font-semibold mb-4">2. Datenerfassung auf dieser Website</h2>
            <h3 className="font-semibold mb-2">Wer ist verantwortlich für die Datenerfassung?</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen Kontaktdaten können Sie dem Impressum entnehmen.
            </p>
            
            <h3 className="font-semibold mb-2">Wie erfassen wir Ihre Daten?</h3>
            <p className="text-muted-foreground text-sm">
              Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen. Andere Daten werden automatisch beim Besuch der Website erfasst.
            </p>
          </section>

          <section className="glass-card p-6">
            <h2 className="font-display text-xl font-semibold mb-4">3. Anonyme Nutzung</h2>
            <p className="text-muted-foreground text-sm">
              Stade News legt besonderen Wert auf Anonymität. Bei anonymer Nutzung werden nur die für den Betrieb notwendigen Daten gespeichert. Eine Zuordnung zu einer Person ist nicht möglich.
            </p>
          </section>

          <section className="glass-card p-6">
            <h2 className="font-display text-xl font-semibold mb-4">4. Ihre Rechte</h2>
            <ul className="text-muted-foreground text-sm space-y-2">
              <li>• Recht auf Auskunft über Ihre gespeicherten Daten</li>
              <li>• Recht auf Berichtigung unrichtiger Daten</li>
              <li>• Recht auf Löschung Ihrer Daten</li>
              <li>• Recht auf Einschränkung der Verarbeitung</li>
              <li>• Recht auf Datenübertragbarkeit</li>
            </ul>
          </section>

          <section className="glass-card p-6">
            <h2 className="font-display text-xl font-semibold mb-4">5. Kontakt</h2>
            <p className="text-muted-foreground text-sm">
              Bei Fragen zum Datenschutz wenden Sie sich an: <a href="mailto:Stade.news@web.de" className="text-primary hover:underline">Stade.news@web.de</a>
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </MainLayout>
  );
};

export default DatenschutzPage;
