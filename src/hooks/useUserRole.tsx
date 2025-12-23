import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UserRoleInfo {
  isAdmin: boolean;
  isLoading: boolean;
}

// Cache for user roles to avoid repeated queries
const roleCache = new Map<string, boolean>();

export const useUserRole = (userId: string | null | undefined): UserRoleInfo => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setIsAdmin(false);
      setIsLoading(false);
      return;
    }

    // Check cache first
    if (roleCache.has(userId)) {
      setIsAdmin(roleCache.get(userId)!);
      setIsLoading(false);
      return;
    }

    const checkRole = async () => {
      try {
        const { data } = await supabase.rpc('has_role', {
          _user_id: userId,
          _role: 'admin'
        });
        
        const isAdminUser = !!data;
        roleCache.set(userId, isAdminUser);
        setIsAdmin(isAdminUser);
      } catch (error) {
        console.error('Error checking user role:', error);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkRole();
  }, [userId]);

  return { isAdmin, isLoading };
};

// Batch check for multiple user IDs
export const checkMultipleAdminRoles = async (userIds: string[]): Promise<Map<string, boolean>> => {
  const result = new Map<string, boolean>();
  const uncachedIds: string[] = [];

  // Check cache first
  userIds.forEach(id => {
    if (roleCache.has(id)) {
      result.set(id, roleCache.get(id)!);
    } else {
      uncachedIds.push(id);
    }
  });

  if (uncachedIds.length === 0) {
    return result;
  }

  try {
    // Query all uncached user roles at once
    const { data } = await supabase
      .from('user_roles')
      .select('user_id, role')
      .in('user_id', uncachedIds)
      .eq('role', 'admin');

    const adminUserIds = new Set((data || []).map(d => d.user_id));

    uncachedIds.forEach(id => {
      const isAdmin = adminUserIds.has(id);
      result.set(id, isAdmin);
      roleCache.set(id, isAdmin);
    });
  } catch (error) {
    console.error('Error checking multiple admin roles:', error);
    uncachedIds.forEach(id => {
      result.set(id, false);
    });
  }

  return result;
};

// Clear cache (useful when roles are updated)
export const clearRoleCache = () => {
  roleCache.clear();
};
