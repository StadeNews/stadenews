import { supabase } from '@/integrations/supabase/client';
import type { Category, Story, Comment, ChatMessage, ChatGroup, GroupMessage, Profile } from '@/types/database';

// Categories
export const fetchCategories = async (): Promise<Category[]> => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('display_order');
  
  if (error) throw error;
  return data as Category[];
};

export const createCategory = async (category: {
  name: string;
  icon: string;
  color: string;
  slug: string;
  description?: string;
}): Promise<Category> => {
  const { data, error } = await supabase
    .from('categories')
    .insert(category)
    .select()
    .single();
  
  if (error) throw error;
  return data as Category;
};

// Stories
export const fetchPublishedStories = async (categorySlug?: string): Promise<Story[]> => {
  let query = supabase
    .from('stories')
    .select(`
      *,
      category:categories(*)
    `)
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (categorySlug) {
    const { data: cat } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', categorySlug)
      .maybeSingle();
    
    if (cat) {
      query = query.eq('category_id', cat.id);
    }
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Story[];
};

export const fetchStoryById = async (id: string, includeOwn?: boolean): Promise<Story | null> => {
  let query = supabase
    .from('stories')
    .select(`
      *,
      category:categories(*)
    `)
    .eq('id', id);

  // If not including own stories, filter to published only
  if (!includeOwn) {
    query = query.eq('status', 'published');
  }

  const { data, error } = await query.maybeSingle();

  if (error) throw error;
  return data as Story | null;
};

export const submitStory = async (story: {
  category_id: string;
  title?: string;
  content: string;
  user_id?: string;
  anonymous_author?: string;
  social_media_suitable?: boolean;
  credits_name?: string;
  media_url?: string;
  media_type?: string;
  media_description?: string;
  media_status?: string;
}): Promise<void> => {
  const { error } = await supabase
    .from('stories')
    .insert(story);
  
  if (error) throw error;
};

// Admin: Fetch all stories
export const fetchAllStories = async (): Promise<Story[]> => {
  const { data, error } = await supabase
    .from('stories')
    .select(`
      *,
      category:categories(*)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Story[];
};

export const updateStoryStatus = async (id: string, status: 'published' | 'rejected'): Promise<void> => {
  const updateData: Record<string, unknown> = { status };
  if (status === 'published') {
    updateData.published_at = new Date().toISOString();
  }
  
  const { error } = await supabase
    .from('stories')
    .update(updateData)
    .eq('id', id);
  
  if (error) throw error;
};

export const createBreakingNews = async (story: {
  title: string;
  content: string;
  category_id: string;
}): Promise<void> => {
  const { error } = await supabase
    .from('stories')
    .insert({
      ...story,
      status: 'published',
      is_breaking: true,
      published_at: new Date().toISOString()
    });
  
  if (error) throw error;
};

// Comments
export const fetchComments = async (storyId: string): Promise<Comment[]> => {
  // NOTE: There is no FK relationship comments.user_id -> profiles.id, so we enrich manually.
  const { data: comments, error } = await supabase
    .from('comments')
    .select('*')
    .eq('story_id', storyId)
    .order('created_at', { ascending: true });

  if (error) throw error;

  const userIds = Array.from(
    new Set((comments ?? []).map((c) => c.user_id).filter(Boolean))
  ) as string[];

  if (userIds.length === 0) {
    return (comments ?? []) as unknown as Comment[];
  }

  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, username, avatar_url')
    .in('id', userIds);

  if (profilesError) throw profilesError;

  const profileById = new Map((profiles ?? []).map((p) => [p.id, p] as const));

  return (comments ?? []).map((c) => ({
    ...(c as any),
    profile: c.user_id ? (profileById.get(c.user_id) ?? null) : null,
  })) as unknown as Comment[];
};

export const addComment = async (comment: {
  story_id: string;
  content: string;
  user_id?: string;
  anonymous_author?: string;
}): Promise<void> => {
  const { error } = await supabase
    .from('comments')
    .insert(comment);
  
  if (error) throw error;
};

// Likes
export const checkUserLiked = async (storyId: string, userId?: string, anonymousId?: string): Promise<boolean> => {
  let query = supabase
    .from('likes')
    .select('id')
    .eq('story_id', storyId);

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

export const toggleLike = async (storyId: string, userId?: string, anonymousId?: string): Promise<boolean> => {
  const hasLiked = await checkUserLiked(storyId, userId, anonymousId);

  if (hasLiked) {
    // Remove like
    let query = supabase
      .from('likes')
      .delete()
      .eq('story_id', storyId);

    if (userId) {
      query = query.eq('user_id', userId);
    } else if (anonymousId) {
      query = query.eq('anonymous_id', anonymousId);
    }

    await query;
    return false;
  } else {
    // Add like
    const { error } = await supabase
      .from('likes')
      .insert({
        story_id: storyId,
        user_id: userId || null,
        anonymous_id: userId ? null : anonymousId
      });
    
    if (error) throw error;
    return true;
  }
};

// Chat Messages
export const fetchChatMessages = async (): Promise<ChatMessage[]> => {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('is_deleted', false)
    .order('created_at', { ascending: true })
    .limit(100);

  if (error) throw error;
  return data as ChatMessage[];
};

export const sendChatMessage = async (message: {
  content: string;
  nickname: string;
  user_id?: string;
  is_anonymous: boolean;
}): Promise<void> => {
  const { error } = await supabase
    .from('chat_messages')
    .insert(message);
  
  if (error) throw error;
};

export const deleteChatMessage = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('chat_messages')
    .update({ is_deleted: true })
    .eq('id', id);
  
  if (error) throw error;
};

// Get category counts
export const fetchCategoryCounts = async (): Promise<Record<string, number>> => {
  const { data, error } = await supabase
    .from('stories')
    .select('category_id')
    .eq('status', 'published');

  if (error) throw error;

  const counts: Record<string, number> = {};
  data?.forEach((story) => {
    if (story.category_id) {
      counts[story.category_id] = (counts[story.category_id] || 0) + 1;
    }
  });

  return counts;
};

// Update story (admin)
export const updateStory = async (id: string, data: {
  title?: string;
  content?: string;
  category_id?: string;
  is_breaking?: boolean;
}): Promise<void> => {
  const { error } = await supabase
    .from('stories')
    .update(data)
    .eq('id', id);
  
  if (error) throw error;
};

// Delete story (admin)
export const deleteStory = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('stories')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

// Chat Groups
export const fetchChatGroups = async (): Promise<ChatGroup[]> => {
  const { data: groups, error } = await supabase
    .from('chat_groups')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) throw error;

  const creatorIds = Array.from(
    new Set((groups ?? []).map((g) => g.creator_id).filter(Boolean))
  ) as string[];

  if (creatorIds.length === 0) {
    return (groups ?? []) as ChatGroup[];
  }

  const { data: creators, error: creatorsError } = await supabase
    .from('profiles')
    .select('*')
    .in('id', creatorIds);

  if (creatorsError) throw creatorsError;

  const creatorById = new Map((creators ?? []).map((c) => [c.id, c] as const));

  return (groups ?? []).map((g) => ({
    ...(g as any),
    creator: g.creator_id ? (creatorById.get(g.creator_id) ?? null) : null,
  })) as unknown as ChatGroup[];
};

export const createChatGroup = async (group: {
  name: string;
  description?: string;
  creator_id: string;
}): Promise<ChatGroup> => {
  const { data, error } = await supabase
    .from('chat_groups')
    .insert(group)
    .select('*')
    .single();

  if (error) throw error;

  // Enrich with creator profile (optional)
  const { data: creator } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', group.creator_id)
    .maybeSingle();

  return {
    ...(data as ChatGroup),
    creator: creator ?? null,
  };
};

export const fetchGroupMessages = async (groupId: string): Promise<GroupMessage[]> => {
  const { data, error } = await supabase
    .from('group_messages')
    .select('*')
    .eq('group_id', groupId)
    .eq('is_deleted', false)
    .order('created_at', { ascending: true })
    .limit(100);

  if (error) throw error;
  return data as GroupMessage[];
};

export const sendGroupMessage = async (message: {
  group_id: string;
  content: string;
  nickname: string;
  user_id?: string;
  is_anonymous: boolean;
}): Promise<void> => {
  const { error } = await supabase
    .from('group_messages')
    .insert(message);
  
  if (error) throw error;
};

// Delete group message (admin)
export const deleteGroupMessage = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('group_messages')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

// Delete chat group (admin)
export const deleteChatGroup = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('chat_groups')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

// User profile with activity
export const fetchUserProfile = async (userId: string): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  return data as Profile | null;
};

export const fetchUserComments = async (userId: string): Promise<Comment[]> => {
  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      story:stories(id, title, content)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) throw error;
  return data as unknown as Comment[];
};

export const fetchUserStories = async (userId: string): Promise<Story[]> => {
  const { data, error } = await supabase
    .from('stories')
    .select(`
      *,
      category:categories(*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) throw error;
  return data as Story[];
};

export const updateUserProfile = async (userId: string, data: {
  username?: string;
  avatar_url?: string;
  bio?: string;
  audio_url?: string;
}): Promise<void> => {
  const { error } = await supabase
    .from('profiles')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', userId);
  
  if (error) throw error;
};
