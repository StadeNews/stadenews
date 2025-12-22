import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { CategoryCard } from "@/components/shared/CategoryCard";
import { CategoryCardSkeleton } from "@/components/shared/SkeletonLoaders";
import { fetchCategories, fetchCategoryCounts } from "@/lib/api";
import { Category } from "@/types/database";

const KategorienPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const loadData = async () => {
      try {
        const [categoriesData, countsData] = await Promise.all([
          fetchCategories(),
          fetchCategoryCounts()
        ]);
        setCategories(categoriesData);
        setCounts(countsData);
      } catch (error) {
        console.error('Error loading categories:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold mb-2">Kategorien</h1>
          <p className="text-muted-foreground">Finde Storys nach Themen</p>
        </div>

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
              <div key={category.id} className="animate-fade-up" style={{ animationDelay: `${index * 0.05}s` }}>
                <CategoryCard category={category} count={counts[category.id] || 0} />
              </div>
            ))
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default KategorienPage;
