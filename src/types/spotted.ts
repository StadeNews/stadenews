export interface SpottedProfile {
  id: string;
  username: string | null;
  avatar_url: string | null;
}

export interface SpottedMedia {
  id: string;
  spotted_id: string;
  media_url: string;
  media_type: 'image' | 'video';
  media_description: string | null;
  media_status: 'pending' | 'approved' | 'rejected';
  rejection_reason: string | null;
  created_at: string;
}

export interface Spotted {
  id: string;
  user_id: string | null;
  anonymous_author: string | null;
  title: string;
  content: string;
  location: string | null;
  spotted_date: string | null;
  spotted_time: string | null;
  likes_count: number;
  created_at: string;
  media_url?: string | null;
  media_type?: string | null;
  media_status?: string | null;
  profile?: SpottedProfile | null;
  spotted_media?: SpottedMedia[];
}

export interface SpottedComment {
  id: string;
  spotted_id: string;
  user_id: string | null;
  anonymous_author: string | null;
  content: string;
  created_at: string;
  profile?: SpottedProfile | null;
}

export interface SpottedLike {
  id: string;
  spotted_id: string;
  user_id: string | null;
  anonymous_id: string | null;
  created_at: string;
}
