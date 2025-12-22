import { MainLayout } from "@/components/layout/MainLayout";
import { Footer } from "@/components/shared/Footer";

const ImpressumPage = () => {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="font-display text-3xl font-bold mb-8">Impressum</h1>
        
        <div className="prose prose-invert max-w-none space-y-6">
          <section className="glass-card p-6">
            <h2 className="font-display text-xl font-semibold mb-4">Angaben gemäß § 5 TMG</h2>
            <p className="text-muted-foreground">
              Stade News<br />
              [Straße und Hausnummer]<br />
              21682 Stade<br />
              Deutschland
            </p>
          </section>

          <section className="glass-card p-6">
            <h2 className="font-display text-xl font-semibold mb-4">Kontakt</h2>
            <p className="text-muted-foreground">
              E-Mail: <a href="mailto:Stade.news@web.de" className="text-primary hover:underline">Stade.news@web.de</a>
            </p>
          </section>

          <section className="glass-card p-6">
            <h2 className="font-display text-xl font-semibold mb-4">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
            <p className="text-muted-foreground">
              [Name des Verantwortlichen]<br />
              [Adresse]<br />
              21682 Stade
            </p>
          </section>

          <section className="glass-card p-6">
            <h2 className="font-display text-xl font-semibold mb-4">Haftungsausschluss</h2>
            <h3 className="font-semibold mb-2">Haftung für Inhalte</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen.
            </p>
            
            <h3 className="font-semibold mb-2">Haftung für Links</h3>
            <p className="text-muted-foreground text-sm">
              Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter verantwortlich.
            </p>
          </section>

          <section className="glass-card p-6">
            <h2 className="font-display text-xl font-semibold mb-4">Urheberrecht</h2>
            <p className="text-muted-foreground text-sm">
              Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </MainLayout>
  );
};

export default ImpressumPage;
