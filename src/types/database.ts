export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string | null;
  color: string;
  display_order: number;
  created_at: string;
}

export interface StoryMedia {
  id: string;
  story_id: string;
  media_url: string;
  media_type: 'image' | 'video';
  media_description: string | null;
  media_status: 'pending' | 'approved' | 'rejected';
  rejection_reason: string | null;
  created_at: string;
}

export interface Story {
  id: string;
  category_id: string | null;
  user_id: string | null;
  title: string | null;
  content: string;
  status: 'pending' | 'published' | 'rejected';
  is_breaking: boolean;
  is_verified?: boolean;
  likes_count: number;
  views_count: number;
  anonymous_author: string | null;
  created_at: string;
  published_at: string | null;
  social_media_suitable?: boolean;
  credits_name?: string | null;
  category?: Category;
  media_url?: string | null;
  media_type?: string | null;
  media_description?: string | null;
  media_status?: 'pending' | 'approved' | 'rejected' | null;
  story_media?: StoryMedia[];
}

export interface Comment {
  id: string;
  story_id: string;
  user_id: string | null;
  content: string;
  anonymous_author: string | null;
  created_at: string;
  profile?: Profile | null;
}

export interface Like {
  id: string;
  story_id: string;
  user_id: string | null;
  anonymous_id: string | null;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  user_id: string | null;
  content: string;
  nickname: string;
  is_anonymous: boolean;
  is_deleted: boolean;
  created_at: string;
}

export interface Profile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  audio_url: string | null;
  is_online: boolean | null;
  likes_count: number | null;
  is_private?: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'moderator' | 'user';
}

export interface ChatGroup {
  id: string;
  name: string;
  description: string | null;
  creator_id: string | null;
  created_at: string;
  is_active: boolean;
  is_closed?: boolean;
  closed_reason?: string | null;
  closed_by?: string | null;
  creator?: Profile | null;
}

export interface GroupMessage {
  id: string;
  group_id: string;
  content: string;
  nickname: string;
  user_id: string | null;
  is_anonymous: boolean;
  is_deleted: boolean;
  created_at: string;
}

export interface AdminMessage {
  id: string;
  user_id: string | null;
  anonymous_id: string | null;
  story_id: string | null;
  admin_message: string;
  user_reply: string | null;
  is_read: boolean;
  created_at: string;
}

export interface Report {
  id: string;
  reporter_user_id: string | null;
  reporter_anonymous_id: string | null;
  content_type: 'story' | 'comment' | 'chat_message' | 'group_message' | 'profile';
  content_id: string;
  reason: string;
  details: string | null;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  created_at: string;
}

export interface UserPresence {
  id: string;
  user_id: string | null;
  anonymous_id: string | null;
  last_seen: string;
  is_online: boolean;
}
