import { useState, useEffect } from 'react';
import { X, Cookie } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('stade-news-cookie-consent');
    if (!consent) {
      // Show after a short delay for better UX
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptAll = () => {
    localStorage.setItem('stade-news-cookie-consent', JSON.stringify({
      necessary: true,
      functional: true,
      accepted_at: new Date().toISOString()
    }));
    setIsVisible(false);
  };

  const acceptNecessary = () => {
    localStorage.setItem('stade-news-cookie-consent', JSON.stringify({
      necessary: true,
      functional: false,
      accepted_at: new Date().toISOString()
    }));
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[90] p-4 md:p-6 bg-card/95 backdrop-blur-md border-t border-border shadow-lg animate-slide-up">
      <div className="container mx-auto max-w-4xl">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex items-start gap-3 flex-1">
            <Cookie className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-lg mb-1">Wir verwenden Cookies</h3>
              <p className="text-sm text-muted-foreground">
                Wir nutzen Cookies, um dir die bestmögliche Erfahrung zu bieten. 
                Notwendige Cookies ermöglichen grundlegende Funktionen wie Login und Navigation. 
                Funktionale Cookies verbessern die Benutzerfreundlichkeit.{' '}
                <Link to="/cookies" className="text-primary hover:underline">
                  Mehr erfahren
                </Link>
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <button
              onClick={acceptNecessary}
              className="btn-secondary text-sm px-4 py-2"
            >
              Nur Notwendige
            </button>
            <button
              onClick={acceptAll}
              className="btn-primary text-sm px-4 py-2"
            >
              Alle akzeptieren
            </button>
          </div>
          
          <button
            onClick={acceptNecessary}
            className="absolute top-4 right-4 md:static p-2 hover:bg-secondary rounded-lg transition-colors"
            aria-label="Schließen"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};