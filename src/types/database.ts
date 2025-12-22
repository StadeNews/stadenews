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

export interface Story {
  id: string;
  category_id: string | null;
  user_id: string | null;
  title: string | null;
  content: string;
  status: 'pending' | 'published' | 'rejected';
  is_breaking: boolean;
  likes_count: number;
  views_count: number;
  anonymous_author: string | null;
  created_at: string;
  published_at: string | null;
  category?: Category;
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
