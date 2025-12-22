import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { CategoryCard, CategoryData } from "@/components/shared/CategoryCard";
import { CategoryCardSkeleton } from "@/components/shared/SkeletonLoaders";
import { Siren, MessageSquare, AlertTriangle, PartyPopper, VolumeX, Heart } from "lucide-react";

const categoriesData: CategoryData[] = [
  {
    id: "blaulicht",
    name: "Blaulicht & Verkehr",
    icon: Siren,
    description: "Unfälle, Polizeieinsätze, Feuerwehr und alles was mit Blaulicht zu tun hat.",
    count: 24,
    color: "bg-red-500/20 text-red-400",
  },
  {
    id: "gossip",
    name: "Stadt-Gossip",
    icon: MessageSquare,
    description: "Gerüchte, Neuigkeiten und alles was in Stade so passiert.",
    count: 56,
    color: "bg-purple-500/20 text-purple-400",
  },
  {
    id: "aufreger",
    name: "Aufreger der Woche",
    icon: AlertTriangle,
    description: "Die heißesten Diskussionen und Themen die Stade bewegen.",
    count: 18,
    color: "bg-orange-500/20 text-orange-400",
  },
  {
    id: "events",
    name: "Events & Freizeit",
    icon: PartyPopper,
    description: "Veranstaltungen, Partys, Konzerte und Freizeittipps.",
    count: 32,
    color: "bg-green-500/20 text-green-400",
  },
  {
    id: "gestaendnisse",
    name: "Anonyme Geständnisse",
    icon: VolumeX,
    description: "Geheimnisse und Geständnisse die du schon immer loswerden wolltest.",
    count: 45,
    color: "bg-blue-500/20 text-blue-400",
  },
  {
    id: "lob",
    name: "Lob & Feedback",
    icon: Heart,
    description: "Positives Feedback, Danksagungen und Lob für Menschen in Stade.",
    count: 28,
    color: "bg-pink-500/20 text-pink-400",
  },
];

const KategorienPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<CategoryData[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCategories(categoriesData);
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold mb-2">Kategorien</h1>
          <p className="text-muted-foreground">Finde Storys nach Themen</p>
        </div>

        {/* Categories Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            <>
              <CategoryCardSkeleton />
              <CategoryCardSkeleton />
              <CategoryCardSkeleton />
              <CategoryCardSkeleton />
              <CategoryCardSkeleton />
              <CategoryCardSkeleton />
            </>
          ) : (
            categories.map((category, index) => (
              <div
                key={category.id}
                className="animate-fade-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <CategoryCard category={category} />
              </div>
            ))
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default KategorienPage;
