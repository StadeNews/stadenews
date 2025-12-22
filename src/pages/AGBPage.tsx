import { MainLayout } from "@/components/layout/MainLayout";
import { Footer } from "@/components/shared/Footer";

const AGBPage = () => {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="font-display text-3xl font-bold mb-8">Allgemeine Geschäftsbedingungen</h1>
        
        <div className="prose prose-invert max-w-none space-y-6">
          <section className="glass-card p-6">
            <h2 className="font-display text-xl font-semibold mb-4">§1 Geltungsbereich</h2>
            <p className="text-muted-foreground text-sm">
              Diese Allgemeinen Geschäftsbedingungen gelten für die Nutzung der Plattform Stade News.
            </p>
          </section>

          <section className="glass-card p-6">
            <h2 className="font-display text-xl font-semibold mb-4">§2 Nutzungsbedingungen</h2>
            <ul className="text-muted-foreground text-sm space-y-2">
              <li>• Die Nutzung ist kostenlos</li>
              <li>• Nutzer müssen mindestens 16 Jahre alt sein</li>
              <li>• Verbotene Inhalte: Hassrede, illegale Inhalte, Falschanschuldigungen</li>
              <li>• Wir behalten uns vor, Inhalte zu moderieren</li>
            </ul>
          </section>

          <section className="glass-card p-6">
            <h2 className="font-display text-xl font-semibold mb-4">§3 Urheberrecht</h2>
            <p className="text-muted-foreground text-sm">
              Mit dem Einsenden von Inhalten räumt der Nutzer Stade News das Recht ein, diese zu veröffentlichen und für Social-Media-Inhalte (z.B. KI-Videos) zu verwenden.
            </p>
          </section>

          <section className="glass-card p-6">
            <h2 className="font-display text-xl font-semibold mb-4">§4 Haftung</h2>
            <p className="text-muted-foreground text-sm">
              Stade News haftet nicht für nutzergenerierten Inhalt. Für die Inhalte sind die jeweiligen Autoren verantwortlich.
            </p>
          </section>

          <section className="glass-card p-6">
            <h2 className="font-display text-xl font-semibold mb-4">§5 Datenschutz</h2>
            <p className="text-muted-foreground text-sm">
              Die Verarbeitung personenbezogener Daten erfolgt gemäß unserer Datenschutzerklärung.
            </p>
          </section>

          <section className="glass-card p-6">
            <h2 className="font-display text-xl font-semibold mb-4">§6 Schlussbestimmungen</h2>
            <p className="text-muted-foreground text-sm">
              Es gilt deutsches Recht. Gerichtsstand ist Stade.
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </MainLayout>
  );
};

export default AGBPage;
