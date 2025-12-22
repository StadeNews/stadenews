import { useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";

const ImpressumPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="font-display text-3xl font-bold mb-8 text-headline">Impressum</h1>
        
        <div className="space-y-6">
          <section className="news-card p-6">
            <h2 className="font-display text-xl font-semibold mb-4">Angaben gemäß § 5 TMG</h2>
            <div className="text-muted-foreground space-y-2">
              <p><strong className="text-foreground">Stade News</strong></p>
              <p>Lokale Nachrichtenplattform für Stade und Umgebung</p>
              <p>21682 Stade, Deutschland</p>
            </div>
          </section>

          <section className="news-card p-6">
            <h2 className="font-display text-xl font-semibold mb-4">Kontakt</h2>
            <div className="text-muted-foreground space-y-2">
              <p>
                <strong className="text-foreground">E-Mail:</strong>{' '}
                <a href="mailto:Stade.news@web.de" className="text-primary hover:underline">Stade.news@web.de</a>
              </p>
              <p className="text-sm">
                Wir bemühen uns, Ihre Anfragen innerhalb von 48 Stunden zu beantworten.
              </p>
            </div>
          </section>

          <section className="news-card p-6">
            <h2 className="font-display text-xl font-semibold mb-4">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
            <div className="text-muted-foreground space-y-2">
              <p>Stade News Redaktion</p>
              <p>21682 Stade</p>
            </div>
          </section>

          <section className="news-card p-6">
            <h2 className="font-display text-xl font-semibold mb-4">Haftungsausschluss (Disclaimer)</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2 text-foreground">Haftung für Inhalte</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
                </p>
                <p className="text-muted-foreground text-sm leading-relaxed mt-2">
                  Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2 text-foreground">Haftung für Links</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar.
                </p>
                <p className="text-muted-foreground text-sm leading-relaxed mt-2">
                  Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Links umgehend entfernen.
                </p>
              </div>
            </div>
          </section>

          <section className="news-card p-6">
            <h2 className="font-display text-xl font-semibold mb-4">Urheberrecht</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers. Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen Gebrauch gestattet.
            </p>
            <p className="text-muted-foreground text-sm leading-relaxed mt-2">
              Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt wurden, werden die Urheberrechte Dritter beachtet. Insbesondere werden Inhalte Dritter als solche gekennzeichnet. Sollten Sie trotzdem auf eine Urheberrechtsverletzung aufmerksam werden, bitten wir um einen entsprechenden Hinweis. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Inhalte umgehend entfernen.
            </p>
          </section>

          <section className="news-card p-6">
            <h2 className="font-display text-xl font-semibold mb-4">Nutzergenerierte Inhalte</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Stade News ist eine Plattform für nutzergenerierte Inhalte. Die veröffentlichten Stories, Kommentare und Chat-Nachrichten stammen von Nutzern der Plattform und geben nicht zwingend die Meinung des Betreibers wieder. Wir bemühen uns, rechtswidrige Inhalte zeitnah zu entfernen, können jedoch keine Garantie für die Richtigkeit oder Vollständigkeit der nutzergenerierten Inhalte übernehmen.
            </p>
          </section>

          <section className="news-card p-6">
            <h2 className="font-display text-xl font-semibold mb-4">Streitschlichtung</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: 
              <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-1">
                https://ec.europa.eu/consumers/odr
              </a>
            </p>
            <p className="text-muted-foreground text-sm leading-relaxed mt-2">
              Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
            </p>
          </section>
        </div>
      </div>
    </MainLayout>
  );
};

export default ImpressumPage;