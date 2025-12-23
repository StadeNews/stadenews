import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Star, FileText, Heart, Trophy } from "lucide-react";

const BADGE_NAMES: Record<number, string> = {
  1: 'Bronze',
  2: 'Silber',
  3: 'Gold',
  4: 'Platin',
  5: 'Diamant',
};

const BADGE_CATEGORY_NAMES: Record<string, string> = {
  commenter: 'Kommentator',
  storyteller: 'Geschichtenerzähler',
  popular: 'Beliebt',
};

const STORAGE_KEY = 'last_checked_badges';

interface StoredBadges {
  [key: string]: number; // badge_type: badge_level
}

export const useBadgeNotifications = (userId: string | undefined) => {
  const { toast } = useToast();
  const hasChecked = useRef(false);

  useEffect(() => {
    if (!userId || hasChecked.current) return;
    hasChecked.current = true;

    const checkForNewBadges = async () => {
      try {
        // Get stored badge levels from localStorage
        const stored = localStorage.getItem(`${STORAGE_KEY}_${userId}`);
        const previousBadges: StoredBadges = stored ? JSON.parse(stored) : {};

        // Fetch current badges from database
        const { data: currentBadges, error } = await supabase
          .from('user_badges')
          .select('badge_type, badge_level')
          .eq('user_id', userId);

        if (error) throw error;

        const newBadges: StoredBadges = {};
        const notifications: { type: string; level: number }[] = [];

        // Check for new or upgraded badges
        (currentBadges || []).forEach(badge => {
          newBadges[badge.badge_type] = badge.badge_level;
          
          const previousLevel = previousBadges[badge.badge_type] || 0;
          if (badge.badge_level > previousLevel) {
            notifications.push({
              type: badge.badge_type,
              level: badge.badge_level,
            });
          }
        });

        // Show notifications for new badges
        notifications.forEach(notification => {
          const categoryName = BADGE_CATEGORY_NAMES[notification.type] || notification.type;
          const levelName = BADGE_NAMES[notification.level] || `Level ${notification.level}`;
          
          toast({
            title: "🏆 Neue Auszeichnung!",
            description: `Du hast das ${levelName} ${categoryName}-Badge erreicht!`,
            duration: 6000,
          });
        });

        // Store current badges for next check
        localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(newBadges));
      } catch (error) {
        console.error('Error checking badges:', error);
      }
    };

    // Delay check slightly to not interfere with page load
    const timeout = setTimeout(checkForNewBadges, 2000);
    return () => clearTimeout(timeout);
  }, [userId, toast]);
};
