import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { NewsCard, NewsItem } from "@/components/shared/NewsCard";
import { NewsCardSkeleton } from "@/components/shared/SkeletonLoaders";
import { Filter, X } from "lucide-react";

// Mock data
const allNews: NewsItem[] = [
  {
    id: "1",
    category: "🚨 Blaulicht",
    categoryColor: "bg-red-500/20 text-red-400",
    title: "Großeinsatz in der Innenstadt",
    excerpt: "Feuerwehr und Polizei waren heute Vormittag mit mehreren Fahrzeugen am Pferdemarkt im Einsatz. Anwohner berichten von starkem Rauch.",
    timestamp: "vor 2 Std.",
    reactions: 45,
  },
  {
    id: "2",
    category: "🗣 Stadt-Gossip",
    categoryColor: "bg-purple-500/20 text-purple-400",
    title: "Bekanntes Restaurant schließt überraschend",
    excerpt: "Das beliebte Restaurant am Hafen hat heute seine Türen für immer geschlossen. Insider berichten von finanziellen Schwierigkeiten.",
    timestamp: "vor 5 Std.",
    reactions: 128,
  },
  {
    id: "3",
    category: "🎉 Events",
    categoryColor: "bg-green-500/20 text-green-400",
    title: "Weihnachtsmarkt startet nächste Woche",
    excerpt: "Endlich ist es soweit! Der traditionelle Stader Weihnachtsmarkt öffnet am Montag seine Pforten mit über 50 Ständen.",
    timestamp: "vor 8 Std.",
    reactions: 89,
  },
  {
    id: "4",
    category: "⚠️ Aufreger",
    categoryColor: "bg-orange-500/20 text-orange-400",
    title: "Parkgebühren steigen drastisch",
    excerpt: "Die Stadt hat eine Erhöhung der Parkgebühren um 50% angekündigt. Bürger sind empört und planen Proteste.",
    timestamp: "vor 12 Std.",
    reactions: 234,
  },
  {
    id: "5",
    category: "🤐 Geständnisse",
    categoryColor: "bg-blue-500/20 text-blue-400",
    title: "Anonymes Geständnis: Ich war der Graffiti-Künstler",
    excerpt: "Nach 5 Jahren melde ich mich zu Wort. Die bunten Kunstwerke am Bahnhof waren von mir...",
    timestamp: "vor 1 Tag",
    reactions: 156,
  },
  {
    id: "6",
    category: "❤️ Lob",
    categoryColor: "bg-pink-500/20 text-pink-400",
    title: "Danke an den unbekannten Helfer!",
    excerpt: "Du hast mir gestern bei meiner Autopanne geholfen und wolltest kein Geld. Du bist ein Held!",
    timestamp: "vor 1 Tag",
    reactions: 89,
  },
];

const categories = [
  { id: "all", name: "Alle" },
  { id: "blaulicht", name: "🚨 Blaulicht" },
  { id: "gossip", name: "🗣 Gossip" },
  { id: "aufreger", name: "⚠️ Aufreger" },
  { id: "events", name: "🎉 Events" },
  { id: "gestaendnisse", name: "🤐 Geständnisse" },
  { id: "lob", name: "❤️ Lob" },
];

const NewsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [news, setNews] = useState<NewsItem[]>([]);
  
  const activeCategory = searchParams.get("kategorie") || "all";

  useEffect(() => {
    // Simulate loading
    setIsLoading(true);
    const timer = setTimeout(() => {
      setNews(allNews);
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [activeCategory]);

  const handleCategoryChange = (categoryId: string) => {
    if (categoryId === "all") {
      setSearchParams({});
    } else {
      setSearchParams({ kategorie: categoryId });
    }
  };

  const filteredNews = activeCategory === "all" 
    ? news 
    : news.filter(n => n.category.toLowerCase().includes(activeCategory));

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold mb-2">News Feed</h1>
          <p className="text-muted-foreground">Die neuesten Storys aus Stade</p>
        </div>

        {/* Category Filter */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Filtern nach:</span>
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  activeCategory === cat.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {activeCategory !== "all" && (
            <button
              onClick={() => handleCategoryChange("all")}
              className="mt-3 flex items-center gap-1 text-sm text-primary hover:underline"
            >
              <X className="w-4 h-4" />
              Filter zurücksetzen
            </button>
          )}
        </div>

        {/* News List */}
        <div className="space-y-4">
          {isLoading ? (
            <>
              <NewsCardSkeleton />
              <NewsCardSkeleton />
              <NewsCardSkeleton />
            </>
          ) : filteredNews.length > 0 ? (
            filteredNews.map((item, index) => (
              <div
                key={item.id}
                className="animate-fade-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <NewsCard news={item} />
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Keine News in dieser Kategorie gefunden.</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default NewsPage;
