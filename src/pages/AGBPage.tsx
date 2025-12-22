import { useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";

const AGBPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="font-display text-3xl font-bold mb-8 text-headline">Allgemeine Geschäftsbedingungen</h1>
        
        <div className="space-y-6">
          <section className="news-card p-6">
            <h2 className="font-display text-xl font-semibold mb-4">§1 Geltungsbereich und Vertragspartner</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für die Nutzung der Plattform "Stade News" (nachfolgend "Plattform" oder "wir"). Mit der Nutzung unserer Dienste akzeptieren Sie diese AGB vollständig.
            </p>
            <p className="text-muted-foreground text-sm leading-relaxed mt-2">
              Vertragspartner ist Stade News, erreichbar unter Stade.news@web.de.
            </p>
          </section>

          <section className="news-card p-6">
            <h2 className="font-display text-xl font-semibold mb-4">§2 Leistungsbeschreibung</h2>
            <p className="text-muted-foreground text-sm leading-relaxed mb-3">
              Stade News ist eine kostenlose Plattform für lokale Nachrichten und Community-Austausch in Stade und Umgebung. Unsere Dienste umfassen:
            </p>
            <ul className="text-muted-foreground text-sm space-y-2 list-disc list-inside">
              <li>Veröffentlichung von nutzergenerierten Nachrichten und Stories</li>
              <li>Community-Chat und Gruppenunterhaltungen</li>
              <li>Kommentarfunktion für veröffentlichte Inhalte</li>
              <li>Anonyme Nutzungsmöglichkeit</li>
              <li>Social-Media-Integration (TikTok, Instagram, Facebook)</li>
            </ul>
          </section>

          <section className="news-card p-6">
            <h2 className="font-display text-xl font-semibold mb-4">§3 Registrierung und Nutzerkonto</h2>
            <div className="space-y-3 text-muted-foreground text-sm leading-relaxed">
              <p><strong className="text-foreground">3.1</strong> Die Nutzung der Plattform ist auch ohne Registrierung (anonym) möglich. Bei anonymer Nutzung wird eine eindeutige ID generiert, die Sie für zukünftige Logins speichern sollten.</p>
              <p><strong className="text-foreground">3.2</strong> Bei der Registrierung müssen Sie wahrheitsgemäße Angaben machen und sind für die Geheimhaltung Ihrer Zugangsdaten verantwortlich.</p>
              <p><strong className="text-foreground">3.3</strong> Das Mindestalter für die Nutzung beträgt 16 Jahre.</p>
              <p><strong className="text-foreground">3.4</strong> Wir behalten uns das Recht vor, Nutzerkonten bei Verstoß gegen diese AGB zu sperren oder zu löschen.</p>
            </div>
          </section>

          <section className="news-card p-6">
            <h2 className="font-display text-xl font-semibold mb-4">§4 Nutzerverhalten und verbotene Inhalte</h2>
            <p className="text-muted-foreground text-sm leading-relaxed mb-3">
              Folgende Inhalte und Verhaltensweisen sind auf unserer Plattform untersagt:
            </p>
            <ul className="text-muted-foreground text-sm space-y-2 list-disc list-inside">
              <li>Hassrede, Diskriminierung und Beleidigungen jeglicher Art</li>
              <li>Gewaltverherrlichende oder gewaltandrohende Inhalte</li>
              <li>Pornografische oder sexuell explizite Inhalte</li>
              <li>Falsche Anschuldigungen und Verleumdungen</li>
              <li>Spam, Werbung und kommerzielle Inhalte ohne Genehmigung</li>
              <li>Verbreitung von Falschinformationen</li>
              <li>Illegale Inhalte oder Aufforderungen zu Straftaten</li>
              <li>Veröffentlichung personenbezogener Daten Dritter ohne deren Einwilligung</li>
              <li>Urheberrechtsverletzungen</li>
            </ul>
            <p className="text-muted-foreground text-sm leading-relaxed mt-3">
              Wir behalten uns vor, Inhalte zu entfernen und Nutzer zu sperren, die gegen diese Regeln verstoßen.
            </p>
          </section>

          <section className="news-card p-6">
            <h2 className="font-display text-xl font-semibold mb-4">§5 Urheberrecht und Nutzungsrechte</h2>
            <div className="space-y-3 text-muted-foreground text-sm leading-relaxed">
              <p><strong className="text-foreground">5.1</strong> Mit dem Einsenden von Inhalten (Stories, Kommentare, Chat-Nachrichten) räumen Sie Stade News das nicht-exklusive, zeitlich unbegrenzte, weltweite Recht ein, diese Inhalte zu veröffentlichen, zu vervielfältigen und zu verbreiten.</p>
              <p><strong className="text-foreground">5.2</strong> Dies schließt die Nutzung für Social-Media-Inhalte ein, insbesondere für KI-generierte Videos auf TikTok, Instagram und Facebook.</p>
              <p><strong className="text-foreground">5.3</strong> Sie versichern, dass Sie über alle erforderlichen Rechte an den von Ihnen eingestellten Inhalten verfügen und keine Rechte Dritter verletzen.</p>
              <p><strong className="text-foreground">5.4</strong> Falls Sie namentlich genannt werden möchten, können Sie dies im "Credits"-Feld bei der Story-Einreichung angeben.</p>
            </div>
          </section>

          <section className="news-card p-6">
            <h2 className="font-display text-xl font-semibold mb-4">§6 Moderation und Prüfung</h2>
            <div className="space-y-3 text-muted-foreground text-sm leading-relaxed">
              <p><strong className="text-foreground">6.1</strong> Eingereichte Stories werden vor der Veröffentlichung von unserem Moderationsteam geprüft.</p>
              <p><strong className="text-foreground">6.2</strong> Wir behalten uns das Recht vor, Inhalte abzulehnen, zu bearbeiten oder zu löschen.</p>
              <p><strong className="text-foreground">6.3</strong> Chat-Nachrichten und Kommentare werden nachträglich moderiert. Nutzer können problematische Inhalte über die Meldefunktion anzeigen.</p>
            </div>
          </section>

          <section className="news-card p-6">
            <h2 className="font-display text-xl font-semibold mb-4">§7 Haftung</h2>
            <div className="space-y-3 text-muted-foreground text-sm leading-relaxed">
              <p><strong className="text-foreground">7.1</strong> Stade News haftet nicht für nutzergenerierte Inhalte. Für diese sind die jeweiligen Autoren verantwortlich.</p>
              <p><strong className="text-foreground">7.2</strong> Wir übernehmen keine Gewähr für die Richtigkeit, Vollständigkeit oder Aktualität der veröffentlichten Inhalte.</p>
              <p><strong className="text-foreground">7.3</strong> Die Haftung für leichte Fahrlässigkeit ist ausgeschlossen, soweit keine wesentlichen Vertragspflichten oder Leben, Körper oder Gesundheit betroffen sind.</p>
            </div>
          </section>

          <section className="news-card p-6">
            <h2 className="font-display text-xl font-semibold mb-4">§8 Datenschutz</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Die Verarbeitung personenbezogener Daten erfolgt gemäß unserer <a href="/datenschutz" className="text-primary hover:underline">Datenschutzerklärung</a>. Stade News legt besonderen Wert auf die Möglichkeit zur anonymen Nutzung.
            </p>
          </section>

          <section className="news-card p-6">
            <h2 className="font-display text-xl font-semibold mb-4">§9 Änderungen der AGB</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Wir behalten uns das Recht vor, diese AGB jederzeit zu ändern. Änderungen werden auf der Plattform bekannt gegeben. Die fortgesetzte Nutzung nach Bekanntgabe gilt als Zustimmung zu den Änderungen.
            </p>
          </section>

          <section className="news-card p-6">
            <h2 className="font-display text-xl font-semibold mb-4">§10 Schlussbestimmungen</h2>
            <div className="space-y-3 text-muted-foreground text-sm leading-relaxed">
              <p><strong className="text-foreground">10.1</strong> Es gilt das Recht der Bundesrepublik Deutschland.</p>
              <p><strong className="text-foreground">10.2</strong> Gerichtsstand ist Stade, soweit gesetzlich zulässig.</p>
              <p><strong className="text-foreground">10.3</strong> Sollten einzelne Bestimmungen dieser AGB unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.</p>
            </div>
          </section>

          <section className="news-card p-6 bg-muted/30">
            <p className="text-muted-foreground text-sm text-center">
              Stand: Dezember 2024 | Bei Fragen: <a href="mailto:Stade.news@web.de" className="text-primary hover:underline">Stade.news@web.de</a>
            </p>
          </section>
        </div>
      </div>
    </MainLayout>
  );
};

export default AGBPage;