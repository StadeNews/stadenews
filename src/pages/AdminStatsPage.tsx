import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  BarChart3, 
  Users, 
  FileText, 
  MessageSquare, 
  Heart, 
  TrendingUp,
  Calendar,
  Loader2,
  ArrowLeft
} from "lucide-react";
import { Link } from "react-router-dom";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface StatsData {
  totalUsers: number;
  totalStories: number;
  publishedStories: number;
  pendingStories: number;
  totalComments: number;
  totalLikes: number;
  storiesByCategory: { name: string; count: number; color: string }[];
  storiesPerDay: { date: string; count: number }[];
  usersPerDay: { date: string; count: number }[];
}

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

const AdminStatsPage = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Wait for auth to finish loading before checking permissions
    if (authLoading) {
      return;
    }

    if (!user) {
      navigate('/');
      return;
    }

    // Only redirect if we've confirmed user is not admin
    if (user && !isAdmin) {
      // Give a small delay to allow isAdmin to update
      const timeout = setTimeout(() => {
        if (!isAdmin) {
          navigate('/');
        }
      }, 500);
      return () => clearTimeout(timeout);
    }

    if (user && isAdmin) {
      loadStats();
    }
  }, [user, isAdmin, authLoading, navigate]);

  const loadStats = async () => {
    try {
      // Fetch all data in parallel
      const [
        { data: profiles },
        { data: stories },
        { data: comments },
        { data: likes },
        { data: categories }
      ] = await Promise.all([
        supabase.from('profiles').select('id, created_at'),
        supabase.from('stories').select('id, status, category_id, created_at, categories(name, color)'),
        supabase.from('comments').select('id'),
        supabase.from('likes').select('id'),
        supabase.from('categories').select('id, name, color')
      ]);

      // Calculate stories by category
      const categoryCount: Record<string, { count: number; name: string; color: string }> = {};
      categories?.forEach(cat => {
        categoryCount[cat.id] = { count: 0, name: cat.name, color: cat.color };
      });
      stories?.forEach(story => {
        if (story.category_id && categoryCount[story.category_id]) {
          categoryCount[story.category_id].count++;
        }
      });

      // Calculate stories per day (last 7 days)
      const last7Days: { date: string; count: number }[] = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const dayName = date.toLocaleDateString('de-DE', { weekday: 'short' });
        const count = stories?.filter(s => s.created_at?.startsWith(dateStr)).length || 0;
        last7Days.push({ date: dayName, count });
      }

      // Calculate users per day (last 7 days)
      const usersLast7Days: { date: string; count: number }[] = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const dayName = date.toLocaleDateString('de-DE', { weekday: 'short' });
        const count = profiles?.filter(p => p.created_at?.startsWith(dateStr)).length || 0;
        usersLast7Days.push({ date: dayName, count });
      }

      setStats({
        totalUsers: profiles?.length || 0,
        totalStories: stories?.length || 0,
        publishedStories: stories?.filter(s => s.status === 'published').length || 0,
        pendingStories: stories?.filter(s => s.status === 'pending').length || 0,
        totalComments: comments?.length || 0,
        totalLikes: likes?.length || 0,
        storiesByCategory: Object.values(categoryCount).filter(c => c.count > 0),
        storiesPerDay: last7Days,
        usersPerDay: usersLast7Days
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      toast({
        title: "Fehler",
        description: "Statistiken konnten nicht geladen werden.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <MainLayout showFooter={false}>
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (!isAdmin || !stats) {
    return null;
  }

  return (
    <MainLayout showFooter={false}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link to="/admin" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4">
              <ArrowLeft className="w-4 h-4" />
              Zurück zum Admin Dashboard
            </Link>
            <h1 className="font-display text-3xl font-bold mb-2 text-foreground flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-primary" />
              Statistiken
            </h1>
            <p className="text-muted-foreground">Übersicht über alle Aktivitäten</p>
          </div>

          {/* Overview Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <Users className="w-6 h-6 mx-auto mb-2 text-blue-500" />
              <p className="text-2xl font-bold text-foreground">{stats.totalUsers}</p>
              <p className="text-xs text-muted-foreground">Nutzer</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <FileText className="w-6 h-6 mx-auto mb-2 text-green-500" />
              <p className="text-2xl font-bold text-foreground">{stats.totalStories}</p>
              <p className="text-xs text-muted-foreground">Stories</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <TrendingUp className="w-6 h-6 mx-auto mb-2 text-emerald-500" />
              <p className="text-2xl font-bold text-foreground">{stats.publishedStories}</p>
              <p className="text-xs text-muted-foreground">Veröffentlicht</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <Calendar className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
              <p className="text-2xl font-bold text-foreground">{stats.pendingStories}</p>
              <p className="text-xs text-muted-foreground">Ausstehend</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <MessageSquare className="w-6 h-6 mx-auto mb-2 text-purple-500" />
              <p className="text-2xl font-bold text-foreground">{stats.totalComments}</p>
              <p className="text-xs text-muted-foreground">Kommentare</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <Heart className="w-6 h-6 mx-auto mb-2 text-red-500" />
              <p className="text-2xl font-bold text-foreground">{stats.totalLikes}</p>
              <p className="text-xs text-muted-foreground">Likes</p>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Stories per Day */}
            <div className="bg-card border border-border rounded-xl p-4">
              <h3 className="font-semibold mb-4 text-foreground flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Stories (letzte 7 Tage)
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={stats.storiesPerDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Users per Day */}
            <div className="bg-card border border-border rounded-xl p-4">
              <h3 className="font-semibold mb-4 text-foreground flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Neue Nutzer (letzte 7 Tage)
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={stats.usersPerDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: 'hsl(var(--primary))' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Stories by Category */}
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="font-semibold mb-4 text-foreground flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Stories nach Kategorie
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={stats.storiesByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {stats.storiesByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {stats.storiesByCategory.map((cat, index) => (
                  <div key={cat.name} className="flex items-center justify-between p-2 bg-secondary/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: cat.color || CHART_COLORS[index % CHART_COLORS.length] }} 
                      />
                      <span className="text-sm text-foreground">{cat.name}</span>
                    </div>
                    <span className="text-sm font-medium text-foreground">{cat.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminStatsPage;
