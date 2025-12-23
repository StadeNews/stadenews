import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Footer } from "@/components/shared/Footer";
import { 
  Trophy, 
  Crown, 
  Medal, 
  Star, 
  MessageSquare, 
  FileText, 
  Heart,
  User,
  Loader2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { AdminCrown, UserBadge } from "@/components/shared/UserBadge";

interface LeaderboardUser {
  id: string;
  username: string | null;
  avatar_url: string | null;
  comment_count: number;
  story_count: number;
  total_likes: number;
  badges: { badge_type: string; badge_level: number }[];
  isAdmin: boolean;
}

const BADGE_TYPE_LABELS: Record<string, { label: string; icon: typeof MessageSquare }> = {
  commenter: { label: 'Kommentator', icon: MessageSquare },
  storyteller: { label: 'Geschichtenerzähler', icon: FileText },
  popular: { label: 'Beliebt', icon: Heart },
};

const LeaderboardPage = () => {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'comments' | 'stories' | 'likes'>('comments');

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      // Get profiles with their stats
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .eq('is_private', false)
        .limit(50);

      if (profilesError) throw profilesError;

      const userIds = (profiles || []).map(p => p.id);
      
      if (userIds.length === 0) {
        setUsers([]);
        setIsLoading(false);
        return;
      }

      // Get comment counts
      const { data: commentCounts } = await supabase
        .from('comments')
        .select('user_id')
        .in('user_id', userIds);

      const commentCountMap = new Map<string, number>();
      (commentCounts || []).forEach(c => {
        commentCountMap.set(c.user_id!, (commentCountMap.get(c.user_id!) || 0) + 1);
      });

      // Get story counts
      const { data: storyCounts } = await supabase
        .from('stories')
        .select('user_id, likes_count')
        .in('user_id', userIds)
        .eq('status', 'published');

      const storyCountMap = new Map<string, number>();
      const likesMap = new Map<string, number>();
      (storyCounts || []).forEach(s => {
        storyCountMap.set(s.user_id!, (storyCountMap.get(s.user_id!) || 0) + 1);
        likesMap.set(s.user_id!, (likesMap.get(s.user_id!) || 0) + (s.likes_count || 0));
      });

      // Get badges
      const { data: badges } = await supabase
        .from('user_badges')
        .select('user_id, badge_type, badge_level')
        .in('user_id', userIds);

      const badgeMap = new Map<string, { badge_type: string; badge_level: number }[]>();
      (badges || []).forEach(b => {
        if (!badgeMap.has(b.user_id)) {
          badgeMap.set(b.user_id, []);
        }
        badgeMap.get(b.user_id)!.push({ badge_type: b.badge_type, badge_level: b.badge_level });
      });

      // Get admin status
      const { data: adminRoles } = await supabase
        .from('user_roles')
        .select('user_id')
        .in('user_id', userIds)
        .eq('role', 'admin');

      const adminSet = new Set((adminRoles || []).map(r => r.user_id));

      // Combine all data
      const leaderboardUsers: LeaderboardUser[] = (profiles || []).map(p => ({
        id: p.id,
        username: p.username,
        avatar_url: p.avatar_url,
        comment_count: commentCountMap.get(p.id) || 0,
        story_count: storyCountMap.get(p.id) || 0,
        total_likes: likesMap.get(p.id) || 0,
        badges: badgeMap.get(p.id) || [],
        isAdmin: adminSet.has(p.id),
      }));

      // Sort by total badges and activity
      leaderboardUsers.sort((a, b) => {
        const aScore = a.comment_count + (a.story_count * 5) + a.total_likes;
        const bScore = b.comment_count + (b.story_count * 5) + b.total_likes;
        return bScore - aScore;
      });

      setUsers(leaderboardUsers);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSortedUsers = () => {
    const sorted = [...users];
    switch (activeTab) {
      case 'comments':
        return sorted.sort((a, b) => b.comment_count - a.comment_count);
      case 'stories':
        return sorted.sort((a, b) => b.story_count - a.story_count);
      case 'likes':
        return sorted.sort((a, b) => b.total_likes - a.total_likes);
      default:
        return sorted;
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 md:w-6 md:h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 md:w-6 md:h-6 text-slate-400" />;
    if (rank === 3) return <Medal className="w-5 h-5 md:w-6 md:h-6 text-amber-600" />;
    return <span className="text-sm md:text-base font-bold text-muted-foreground w-5 md:w-6 text-center">{rank}</span>;
  };

  const sortedUsers = getSortedUsers();

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-3xl">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 mb-3 md:mb-4">
            <Trophy className="w-7 h-7 md:w-8 md:h-8 text-white" />
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold mb-2">Rangliste</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Die aktivsten Mitglieder der Community
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 md:gap-2 mb-4 md:mb-6 bg-secondary/50 p-1 rounded-xl">
          {[
            { key: 'comments', label: 'Kommentare', icon: MessageSquare },
            { key: 'stories', label: 'Stories', icon: FileText },
            { key: 'likes', label: 'Likes', icon: Heart },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 md:gap-2 py-2 md:py-2.5 px-2 md:px-4 rounded-lg text-xs md:text-sm font-medium transition-all",
                activeTab === tab.key
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >
              <tab.icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label.slice(0, 4)}</span>
            </button>
          ))}
        </div>

        {/* Leaderboard */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : sortedUsers.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            Noch keine Nutzer in der Rangliste.
          </div>
        ) : (
          <div className="space-y-2 md:space-y-3">
            {sortedUsers.slice(0, 20).map((user, index) => {
              const rank = index + 1;
              const value = activeTab === 'comments' ? user.comment_count 
                : activeTab === 'stories' ? user.story_count 
                : user.total_likes;

              return (
                <Link
                  key={user.id}
                  to={`/profile/${user.username}`}
                  className={cn(
                    "flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl transition-all hover:scale-[1.01]",
                    rank === 1 ? "bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/30" :
                    rank === 2 ? "bg-gradient-to-r from-slate-400/20 to-slate-500/20 border border-slate-400/30" :
                    rank === 3 ? "bg-gradient-to-r from-amber-600/20 to-orange-600/20 border border-amber-600/30" :
                    "bg-card border border-border hover:border-primary/50"
                  )}
                >
                  {/* Rank */}
                  <div className="flex-shrink-0 w-6 md:w-8 flex items-center justify-center">
                    {getRankIcon(rank)}
                  </div>

                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                      )}
                    </div>
                    {user.isAdmin && (
                      <div className="absolute -top-1 -right-1">
                        <AdminCrown size="sm" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
                      <span className="font-semibold text-sm md:text-base truncate">
                        {user.username || 'Anonym'}
                      </span>
                      {user.badges.map(badge => (
                        <UserBadge 
                          key={badge.badge_type} 
                          type={badge.badge_type as 'commenter'} 
                          level={badge.badge_level} 
                          size="sm" 
                        />
                      ))}
                    </div>
                    <div className="flex items-center gap-2 md:gap-3 text-[10px] md:text-xs text-muted-foreground mt-0.5">
                      <span className="flex items-center gap-0.5 md:gap-1">
                        <MessageSquare className="w-3 h-3" /> {user.comment_count}
                      </span>
                      <span className="flex items-center gap-0.5 md:gap-1">
                        <FileText className="w-3 h-3" /> {user.story_count}
                      </span>
                      <span className="flex items-center gap-0.5 md:gap-1">
                        <Heart className="w-3 h-3" /> {user.total_likes}
                      </span>
                    </div>
                  </div>

                  {/* Value */}
                  <div className="flex-shrink-0 text-right">
                    <span className="text-lg md:text-xl font-bold text-primary">{value}</span>
                    <p className="text-[10px] md:text-xs text-muted-foreground">
                      {activeTab === 'comments' ? 'Komm.' : activeTab === 'stories' ? 'Stories' : 'Likes'}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Badge Legend */}
        <div className="mt-6 md:mt-8 glass-card p-4 md:p-6">
          <h3 className="font-medium text-sm md:text-base mb-3 md:mb-4 flex items-center gap-2">
            <Star className="w-4 h-4 md:w-5 md:h-5 text-primary" />
            Auszeichnungen
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
            {Object.entries(BADGE_TYPE_LABELS).map(([type, { label, icon: Icon }]) => (
              <div key={type} className="bg-secondary/50 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-4 h-4 text-primary" />
                  <span className="font-medium text-xs md:text-sm">{label}</span>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(level => (
                    <UserBadge key={level} type={type as 'commenter'} level={level} size="sm" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </MainLayout>
  );
};

export default LeaderboardPage;
