import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { NewsCard } from "@/components/shared/NewsCard";
import { NewsCardSkeleton } from "@/components/shared/SkeletonLoaders";
import { Filter, X } from "lucide-react";
import { fetchPublishedStories, fetchCategories } from "@/lib/api";
import { Story, Category } from "@/types/database";

const NewsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [stories, setStories] = useState<Story[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  const activeCategory = searchParams.get("kategorie") || "all";

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [storiesData, categoriesData] = await Promise.all([
          fetchPublishedStories(activeCategory === 'all' ? undefined : activeCategory),
          fetchCategories()
        ]);
        setStories(storiesData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error loading stories:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [activeCategory]);

  const handleCategoryChange = (categorySlug: string) => {
    if (categorySlug === "all") {
      setSearchParams({});
    } else {
      setSearchParams({ kategorie: categorySlug });
    }
  };

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
            <button
              onClick={() => handleCategoryChange("all")}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                activeCategory === "all"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
              }`}
            >
              Alle
            </button>
            {categories.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => handleCategoryChange(cat.slug)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  activeCategory === cat.slug
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
          ) : stories.length > 0 ? (
            stories.map((story, index) => (
              <div
                key={story.id}
                className="animate-fade-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <NewsCard story={story} />
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
