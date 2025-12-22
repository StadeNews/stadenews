import type { Profile } from './database';

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
  profile?: Profile | null;
}

export interface SpottedComment {
  id: string;
  spotted_id: string;
  user_id: string | null;
  anonymous_author: string | null;
  content: string;
  created_at: string;
  profile?: Profile | null;
}

export interface SpottedLike {
  id: string;
  spotted_id: string;
  user_id: string | null;
  anonymous_id: string | null;
  created_at: string;
}
