import { supabase } from '@/integrations/supabase/client';
import type { Spotted, SpottedComment } from '@/types/spotted';

// Fetch all spotted posts
export const fetchSpottedPosts = async (): Promise<Spotted[]> => {
  const { data: posts, error } = await supabase
    .from('spotted')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Enrich with profile data
  const userIds = Array.from(
    new Set((posts ?? []).map((p) => p.user_id).filter(Boolean))
  ) as string[];

  if (userIds.length === 0) {
    return (posts ?? []) as Spotted[];
  }

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, username, avatar_url')
    .in('id', userIds);

  const profileById = new Map((profiles ?? []).map((p) => [p.id, p] as const));

  return (posts ?? []).map((p) => ({
    ...p,
    profile: p.user_id ? (profileById.get(p.user_id) ?? null) : null,
  })) as Spotted[];
};

// Fetch single spotted post
export const fetchSpottedById = async (id: string): Promise<Spotted | null> => {
  const { data, error } = await supabase
    .from('spotted')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  // Enrich with profile
  if (data.user_id) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, username, avatar_url')
      .eq('id', data.user_id)
      .maybeSingle();
    
    return { ...data, profile } as Spotted;
  }

  return data as Spotted;
};

// Create spotted post
export const createSpottedPost = async (post: {
  title: string;
  content: string;
  location?: string;
  spotted_date?: string;
  spotted_time?: string;
  user_id?: string;
  anonymous_author?: string;
}): Promise<void> => {
  const { error } = await supabase
    .from('spotted')
    .insert(post);

  if (error) throw error;
};

// Fetch comments for spotted post
export const fetchSpottedComments = async (spottedId: string): Promise<SpottedComment[]> => {
  const { data: comments, error } = await supabase
    .from('spotted_comments')
    .select('*')
    .eq('spotted_id', spottedId)
    .order('created_at', { ascending: true });

  if (error) throw error;

  const userIds = Array.from(
    new Set((comments ?? []).map((c) => c.user_id).filter(Boolean))
  ) as string[];

  if (userIds.length === 0) {
    return (comments ?? []) as SpottedComment[];
  }

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, username, avatar_url')
    .in('id', userIds);

  const profileById = new Map((profiles ?? []).map((p) => [p.id, p] as const));

  return (comments ?? []).map((c) => ({
    ...c,
    profile: c.user_id ? (profileById.get(c.user_id) ?? null) : null,
  })) as SpottedComment[];
};

// Add comment
export const addSpottedComment = async (comment: {
  spotted_id: string;
  content: string;
  user_id?: string;
  anonymous_author?: string;
}): Promise<void> => {
  const { error } = await supabase
    .from('spotted_comments')
    .insert(comment);

  if (error) throw error;
};

// Check if user liked
export const checkSpottedLiked = async (
  spottedId: string,
  userId?: string,
  anonymousId?: string
): Promise<boolean> => {
  let query = supabase
    .from('spotted_likes')
    .select('id')
    .eq('spotted_id', spottedId);

  if (userId) {
    query = query.eq('user_id', userId);
  } else if (anonymousId) {
    query = query.eq('anonymous_id', anonymousId);
  } else {
    return false;
  }

  const { data } = await query.maybeSingle();
  return !!data;
};

// Toggle like
export const toggleSpottedLike = async (
  spottedId: string,
  userId?: string,
  anonymousId?: string
): Promise<boolean> => {
  const hasLiked = await checkSpottedLiked(spottedId, userId, anonymousId);

  if (hasLiked) {
    let query = supabase
      .from('spotted_likes')
      .delete()
      .eq('spotted_id', spottedId);

    if (userId) {
      query = query.eq('user_id', userId);
    } else if (anonymousId) {
      query = query.eq('anonymous_id', anonymousId);
    }

    await query;
    return false;
  } else {
    const { error } = await supabase
      .from('spotted_likes')
      .insert({
        spotted_id: spottedId,
        user_id: userId || null,
        anonymous_id: userId ? null : anonymousId,
      });

    if (error) throw error;
    return true;
  }
};
