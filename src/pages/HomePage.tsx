import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { NewsCard } from "@/components/shared/NewsCard";
import { NewsCardSkeleton } from "@/components/shared/SkeletonLoaders";
import { Shield, Zap, Users, ChevronRight, Instagram, Mail, Facebook, Phone, Heart } from "lucide-react";
import { fetchPublishedStories, fetchCategories } from "@/lib/api";
import { Story, Category } from "@/types/database";
import stadeNewsLogo from "@/assets/stade-news-logo.png";

const features = [
  {
    icon: Shield,
    title: "100% Anonym",
    description: "Keine Registrierung nötig – deine Identität bleibt geheim.",
  },
  {
    icon: Zap,
    title: "Schneller als die Zeitung",
    description: "News direkt aus der Stadt – in Echtzeit.",
  },
  {
    icon: Users,
    title: "Deine Stimme für Stade",
    description: "Community statt Redaktion – von Stadern für Stader.",
  },
];

const HomePage = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [storiesData, categoriesData] = await Promise.all([
          fetchPublishedStories(),
          fetchCategories()
        ]);
        setStories(storiesData.slice(0, 5));
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const categoryIcons: Record<string, string> = {
    blaulicht: '🚨',
    gossip: '🗣',
    aufreger: '⚠️',
    events: '🎉',
    gestaendnisse: '🤐',
    lob: '❤️'
  };

  return (
    <MainLayout>
      {/* Help Hotline - Prominent */}
      <section className="bg-destructive/5 border-b border-destructive/10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-sm">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-destructive" />
              <span className="text-muted-foreground">Brauchst du Hilfe?</span>
            </div>
            <a 
              href="tel:0800-1110111" 
              className="text-destructive font-semibold hover:underline flex items-center gap-1"
            >
              <Phone className="w-4 h-4" />
              0800-111 0 111
            </a>
            <span className="text-muted-foreground text-xs">(TelefonSeelsorge - 24/7 kostenlos)</span>
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="text-center max-w-3xl mx-auto">
            {/* Logo */}
            <div className="w-20 h-20 mx-auto mb-6 rounded-xl overflow-hidden border-2 border-primary/20 shadow-lg animate-fade-in">
              <img src={stadeNewsLogo} alt="Stade News" className="w-full h-full object-cover" />
            </div>
            
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in text-headline">
              <span className="text-primary">Stade</span> News
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 animate-fade-in font-body" style={{ animationDelay: "0.1s" }}>
              Deine Stadt. Deine Storys.{" "}
              <span className="text-primary font-semibold">Anonym & Echt.</span>
            </p>
            
            <Link
              to="/senden"
              className="btn-primary text-lg px-8 py-4 animate-fade-in shadow-lg hover:shadow-xl"
              style={{ animationDelay: "0.2s" }}
            >
              Story anonym einsenden
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="news-card p-6 text-center hover-lift animate-fade-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center">
                <feature.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-display font-bold text-lg mb-2 text-headline">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Categories */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              to={`/news?kategorie=${cat.slug}`}
              className="flex items-center gap-2 px-5 py-3 news-card hover:bg-primary/5 transition-all whitespace-nowrap min-h-[48px]"
            >
              <span className="text-lg">{categoryIcons[cat.slug] || '📰'}</span>
              <span className="text-sm font-semibold">{cat.name.split(' ')[0]}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Latest News */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-headline">Neueste News</h2>
          <Link
            to="/news"
            className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
          >
            Alle anzeigen
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="space-y-4">
          {isLoading ? (
            <>
              <NewsCardSkeleton />
              <NewsCardSkeleton />
              <NewsCardSkeleton />
            </>
          ) : stories.length > 0 ? (
            stories.map((story, index) => (
              <div
                key={story.id}
                className="animate-fade-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <NewsCard story={story} />
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-muted-foreground news-card">
              <p className="text-lg">Noch keine News vorhanden.</p>
              <Link to="/senden" className="text-primary font-semibold hover:underline mt-2 inline-block">
                Sei der Erste und sende eine Story!
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Social Media Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="news-card p-8 text-center">
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-4 text-headline">Folge uns auf Social Media</h2>
          <p className="text-muted-foreground mb-6">Für die neuesten KI-Videos und Story-Highlights</p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <a
              href="https://www.tiktok.com/@stadenews?_r=1&_t=ZG-92RWOTA5fVY"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary w-full sm:w-auto hover-lift"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
              </svg>
              TikTok
            </a>
            
            <a
              href="https://www.instagram.com/stadenews?igsh=MWc5ZjNudHo1MmdxZA=="
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary w-full sm:w-auto hover-lift"
            >
              <Instagram className="w-5 h-5" />
              Instagram
            </a>

            <a
              href="https://www.facebook.com/share/1Wq2pNJ5oY/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary w-full sm:w-auto hover-lift"
            >
              <Facebook className="w-5 h-5" />
              Facebook
            </a>
          </div>

          {/* Contact */}
          <div className="pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground mb-3">Kontaktiere uns:</p>
            <a 
              href="mailto:Stade.news@web.de"
              className="inline-flex items-center gap-2 text-primary font-semibold hover:underline text-lg"
            >
              <Mail className="w-5 h-5" />
              Stade.news@web.de
            </a>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default HomePage;