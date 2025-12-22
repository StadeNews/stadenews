import { supabase } from '@/integrations/supabase/client';
import type { Category, Story, Comment, Like, ChatMessage } from '@/types/database';

// Categories
export const fetchCategories = async (): Promise<Category[]> => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('display_order');
  
  if (error) throw error;
  return data as Category[];
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

export const fetchStoryById = async (id: string): Promise<Story | null> => {
  const { data, error } = await supabase
    .from('stories')
    .select(`
      *,
      category:categories(*)
    `)
    .eq('id', id)
    .eq('status', 'published')
    .maybeSingle();

  if (error) throw error;
  return data as Story | null;
};

export const submitStory = async (story: {
  category_id: string;
  title?: string;
  content: string;
  user_id?: string;
  anonymous_author?: string;
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
  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      profile:profiles(username, avatar_url)
    `)
    .eq('story_id', storyId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data as unknown as Comment[];
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
