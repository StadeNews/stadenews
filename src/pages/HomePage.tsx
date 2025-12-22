import { Link } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Shield, Zap, Users, ChevronRight, Siren, MessageSquare, AlertTriangle, PartyPopper, Heart, Instagram } from "lucide-react";
import { NewsCard, NewsItem } from "@/components/shared/NewsCard";

// Mock data
const latestNews: NewsItem[] = [
  {
    id: "1",
    category: "🚨 Blaulicht",
    categoryColor: "bg-red-500/20 text-red-400",
    title: "Großeinsatz in der Innenstadt",
    excerpt: "Feuerwehr und Polizei waren heute Vormittag mit mehreren Fahrzeugen am Pferdemarkt im Einsatz...",
    timestamp: "vor 2 Std.",
    reactions: 45,
  },
  {
    id: "2",
    category: "🗣 Gossip",
    categoryColor: "bg-purple-500/20 text-purple-400",
    title: "Bekanntes Restaurant schließt überraschend",
    excerpt: "Das beliebte Restaurant am Hafen hat heute seine Türen für immer geschlossen. Insider berichten von...",
    timestamp: "vor 5 Std.",
    reactions: 128,
  },
  {
    id: "3",
    category: "🎉 Events",
    categoryColor: "bg-green-500/20 text-green-400",
    title: "Weihnachtsmarkt startet nächste Woche",
    excerpt: "Endlich ist es soweit! Der traditionelle Stader Weihnachtsmarkt öffnet am Montag seine Pforten...",
    timestamp: "vor 8 Std.",
    reactions: 89,
  },
];

const features = [
  {
    icon: Shield,
    title: "100% Anonym",
    description: "Keine Registrierung, kein Tracking – deine Identität bleibt geheim.",
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

const categories = [
  { icon: Siren, name: "Blaulicht", color: "text-red-400" },
  { icon: MessageSquare, name: "Gossip", color: "text-purple-400" },
  { icon: AlertTriangle, name: "Aufreger", color: "text-orange-400" },
  { icon: PartyPopper, name: "Events", color: "text-green-400" },
];

const HomePage = () => {
  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/10 rounded-full blur-[120px]" />
        </div>

        <div className="container mx-auto px-4 py-16 md:py-24 relative">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="font-display text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
              <span className="neon-text text-primary">Stade</span>{" "}
              <span className="text-foreground">News</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 animate-fade-in" style={{ animationDelay: "0.1s" }}>
              Deine Stadt. Deine Storys.{" "}
              <span className="text-primary font-medium">Anonym & Echt.</span>
            </p>
            
            <Link
              to="/senden"
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold text-lg neon-glow hover:scale-105 transition-all duration-300 animate-fade-in"
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
              className="glass-card p-6 text-center hover-lift animate-fade-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-primary/20 flex items-center justify-center">
                <feature.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">{feature.title}</h3>
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
              key={cat.name}
              to={`/news?kategorie=${cat.name.toLowerCase()}`}
              className="flex items-center gap-2 px-4 py-2 glass-card hover:bg-secondary/50 transition-all whitespace-nowrap"
            >
              <cat.icon className={`w-4 h-4 ${cat.color}`} />
              <span className="text-sm font-medium">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Latest News */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-bold">Neueste News</h2>
          <Link
            to="/news"
            className="flex items-center gap-1 text-sm text-primary hover:underline"
          >
            Alle anzeigen
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="space-y-4">
          {latestNews.map((news, index) => (
            <div
              key={news.id}
              className="animate-fade-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <NewsCard news={news} />
            </div>
          ))}
        </div>
      </section>

      {/* Social Media Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="glass-card p-8 text-center">
          <h2 className="font-display text-2xl font-bold mb-4">Folge uns auf Social Media</h2>
          <p className="text-muted-foreground mb-6">Für die neuesten KI-Videos und Story-Highlights</p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://tiktok.com/@stadenews"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-6 py-3 bg-secondary hover:bg-secondary/80 rounded-xl transition-all hover-lift w-full sm:w-auto justify-center"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
              </svg>
              <span className="font-medium">TikTok folgen</span>
            </a>
            
            <a
              href="https://instagram.com/stadenews"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 rounded-xl transition-all hover-lift w-full sm:w-auto justify-center border border-purple-500/30"
            >
              <Instagram className="w-6 h-6 text-pink-400" />
              <span className="font-medium">Instagram folgen</span>
            </a>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default HomePage;
