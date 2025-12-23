export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admin_messages: {
        Row: {
          admin_message: string
          anonymous_id: string | null
          created_at: string
          id: string
          is_read: boolean | null
          story_id: string | null
          user_id: string | null
          user_reply: string | null
        }
        Insert: {
          admin_message: string
          anonymous_id?: string | null
          created_at?: string
          id?: string
          is_read?: boolean | null
          story_id?: string | null
          user_id?: string | null
          user_reply?: string | null
        }
        Update: {
          admin_message?: string
          anonymous_id?: string | null
          created_at?: string
          id?: string
          is_read?: boolean | null
          story_id?: string | null
          user_id?: string | null
          user_reply?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_messages_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
        ]
      }
      anonymous_ids: {
        Row: {
          anonymous_id: string
          created_at: string
          id: string
          last_seen_at: string
          nickname: string
        }
        Insert: {
          anonymous_id: string
          created_at?: string
          id?: string
          last_seen_at?: string
          nickname: string
        }
        Update: {
          anonymous_id?: string
          created_at?: string
          id?: string
          last_seen_at?: string
          nickname?: string
        }
        Relationships: []
      }
      banned_users: {
        Row: {
          anonymous_id: string | null
          banned_by: string
          banned_until: string | null
          created_at: string
          id: string
          reason: string
          user_id: string | null
        }
        Insert: {
          anonymous_id?: string | null
          banned_by: string
          banned_until?: string | null
          created_at?: string
          id?: string
          reason: string
          user_id?: string | null
        }
        Update: {
          anonymous_id?: string | null
          banned_by?: string
          banned_until?: string | null
          created_at?: string
          id?: string
          reason?: string
          user_id?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          color: string
          created_at: string
          description: string | null
          display_order: number | null
          icon: string
          id: string
          name: string
          slug: string
        }
        Insert: {
          color: string
          created_at?: string
          description?: string | null
          display_order?: number | null
          icon: string
          id?: string
          name: string
          slug: string
        }
        Update: {
          color?: string
          created_at?: string
          description?: string | null
          display_order?: number | null
          icon?: string
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      chat_groups: {
        Row: {
          closed_by: string | null
          closed_reason: string | null
          created_at: string
          creator_id: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_closed: boolean | null
          name: string
        }
        Insert: {
          closed_by?: string | null
          closed_reason?: string | null
          created_at?: string
          creator_id?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_closed?: boolean | null
          name: string
        }
        Update: {
          closed_by?: string | null
          closed_reason?: string | null
          created_at?: string
          creator_id?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_closed?: boolean | null
          name?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_anonymous: boolean | null
          is_deleted: boolean | null
          nickname: string
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_anonymous?: boolean | null
          is_deleted?: boolean | null
          nickname: string
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_anonymous?: boolean | null
          is_deleted?: boolean | null
          nickname?: string
          user_id?: string | null
        }
        Relationships: []
      }
      comments: {
        Row: {
          anonymous_author: string | null
          content: string
          created_at: string
          id: string
          story_id: string
          user_id: string | null
        }
        Insert: {
          anonymous_author?: string | null
          content: string
          created_at?: string
          id?: string
          story_id: string
          user_id?: string | null
        }
        Update: {
          anonymous_author?: string | null
          content?: string
          created_at?: string
          id?: string
          story_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
        ]
      }
      group_messages: {
        Row: {
          content: string
          created_at: string
          group_id: string
          id: string
          is_anonymous: boolean | null
          is_deleted: boolean | null
          nickname: string
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          group_id: string
          id?: string
          is_anonymous?: boolean | null
          is_deleted?: boolean | null
          nickname: string
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          group_id?: string
          id?: string
          is_anonymous?: boolean | null
          is_deleted?: boolean | null
          nickname?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "group_messages_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "chat_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      likes: {
        Row: {
          anonymous_id: string | null
          created_at: string
          id: string
          story_id: string
          user_id: string | null
        }
        Insert: {
          anonymous_id?: string | null
          created_at?: string
          id?: string
          story_id: string
          user_id?: string | null
        }
        Update: {
          anonymous_id?: string | null
          created_at?: string
          id?: string
          story_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "likes_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
        ]
      }
      login_attempts: {
        Row: {
          attempted_at: string
          email_or_id: string
          id: string
          ip_address: string | null
          successful: boolean | null
        }
        Insert: {
          attempted_at?: string
          email_or_id: string
          id?: string
          ip_address?: string | null
          successful?: boolean | null
        }
        Update: {
          attempted_at?: string
          email_or_id?: string
          id?: string
          ip_address?: string | null
          successful?: boolean | null
        }
        Relationships: []
      }
      profile_likes: {
        Row: {
          created_at: string
          id: string
          liker_anonymous_id: string | null
          liker_user_id: string | null
          profile_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          liker_anonymous_id?: string | null
          liker_user_id?: string | null
          profile_id: string
        }
        Update: {
          created_at?: string
          id?: string
          liker_anonymous_id?: string | null
          liker_user_id?: string | null
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_likes_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          audio_url: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          id: string
          is_online: boolean | null
          likes_count: number | null
          updated_at: string
          username: string | null
        }
        Insert: {
          audio_url?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          id: string
          is_online?: boolean | null
          likes_count?: number | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          audio_url?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          id?: string
          is_online?: boolean | null
          likes_count?: number | null
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          subscribed_to_breaking: boolean | null
          user_id: string | null
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          subscribed_to_breaking?: boolean | null
          user_id?: string | null
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          subscribed_to_breaking?: boolean | null
          user_id?: string | null
        }
        Relationships: []
      }
      reports: {
        Row: {
          content_id: string
          content_type: string
          created_at: string
          details: string | null
          id: string
          reason: string
          reporter_anonymous_id: string | null
          reporter_user_id: string | null
          status: string | null
        }
        Insert: {
          content_id: string
          content_type: string
          created_at?: string
          details?: string | null
          id?: string
          reason: string
          reporter_anonymous_id?: string | null
          reporter_user_id?: string | null
          status?: string | null
        }
        Update: {
          content_id?: string
          content_type?: string
          created_at?: string
          details?: string | null
          id?: string
          reason?: string
          reporter_anonymous_id?: string | null
          reporter_user_id?: string | null
          status?: string | null
        }
        Relationships: []
      }
      spotted: {
        Row: {
          anonymous_author: string | null
          content: string
          created_at: string
          id: string
          likes_count: number | null
          location: string | null
          spotted_date: string | null
          spotted_time: string | null
          title: string
          user_id: string | null
        }
        Insert: {
          anonymous_author?: string | null
          content: string
          created_at?: string
          id?: string
          likes_count?: number | null
          location?: string | null
          spotted_date?: string | null
          spotted_time?: string | null
          title: string
          user_id?: string | null
        }
        Update: {
          anonymous_author?: string | null
          content?: string
          created_at?: string
          id?: string
          likes_count?: number | null
          location?: string | null
          spotted_date?: string | null
          spotted_time?: string | null
          title?: string
          user_id?: string | null
        }
        Relationships: []
      }
      spotted_comments: {
        Row: {
          anonymous_author: string | null
          content: string
          created_at: string
          id: string
          spotted_id: string
          user_id: string | null
        }
        Insert: {
          anonymous_author?: string | null
          content: string
          created_at?: string
          id?: string
          spotted_id: string
          user_id?: string | null
        }
        Update: {
          anonymous_author?: string | null
          content?: string
          created_at?: string
          id?: string
          spotted_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "spotted_comments_spotted_id_fkey"
            columns: ["spotted_id"]
            isOneToOne: false
            referencedRelation: "spotted"
            referencedColumns: ["id"]
          },
        ]
      }
      spotted_likes: {
        Row: {
          anonymous_id: string | null
          created_at: string
          id: string
          spotted_id: string
          user_id: string | null
        }
        Insert: {
          anonymous_id?: string | null
          created_at?: string
          id?: string
          spotted_id: string
          user_id?: string | null
        }
        Update: {
          anonymous_id?: string | null
          created_at?: string
          id?: string
          spotted_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "spotted_likes_spotted_id_fkey"
            columns: ["spotted_id"]
            isOneToOne: false
            referencedRelation: "spotted"
            referencedColumns: ["id"]
          },
        ]
      }
      spotted_responses: {
        Row: {
          anonymous_author: string | null
          contact_info: string | null
          created_at: string
          id: string
          is_read: boolean | null
          message: string
          spotted_id: string
          user_id: string | null
        }
        Insert: {
          anonymous_author?: string | null
          contact_info?: string | null
          created_at?: string
          id?: string
          is_read?: boolean | null
          message: string
          spotted_id: string
          user_id?: string | null
        }
        Update: {
          anonymous_author?: string | null
          contact_info?: string | null
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string
          spotted_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "spotted_responses_spotted_id_fkey"
            columns: ["spotted_id"]
            isOneToOne: false
            referencedRelation: "spotted"
            referencedColumns: ["id"]
          },
        ]
      }
      stories: {
        Row: {
          anonymous_author: string | null
          category_id: string | null
          content: string
          created_at: string
          credits_name: string | null
          id: string
          is_breaking: boolean | null
          likes_count: number | null
          media_description: string | null
          media_status: string | null
          media_type: string | null
          media_url: string | null
          published_at: string | null
          social_media_suitable: boolean | null
          status: string | null
          title: string | null
          user_id: string | null
          views_count: number | null
        }
        Insert: {
          anonymous_author?: string | null
          category_id?: string | null
          content: string
          created_at?: string
          credits_name?: string | null
          id?: string
          is_breaking?: boolean | null
          likes_count?: number | null
          media_description?: string | null
          media_status?: string | null
          media_type?: string | null
          media_url?: string | null
          published_at?: string | null
          social_media_suitable?: boolean | null
          status?: string | null
          title?: string | null
          user_id?: string | null
          views_count?: number | null
        }
        Update: {
          anonymous_author?: string | null
          category_id?: string | null
          content?: string
          created_at?: string
          credits_name?: string | null
          id?: string
          is_breaking?: boolean | null
          likes_count?: number | null
          media_description?: string | null
          media_status?: string | null
          media_type?: string | null
          media_url?: string | null
          published_at?: string | null
          social_media_suitable?: boolean | null
          status?: string | null
          title?: string | null
          user_id?: string | null
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "stories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      story_media: {
        Row: {
          created_at: string
          id: string
          media_description: string | null
          media_status: string
          media_type: string
          media_url: string
          rejection_reason: string | null
          story_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          media_description?: string | null
          media_status?: string
          media_type: string
          media_url: string
          rejection_reason?: string | null
          story_id: string
        }
        Update: {
          created_at?: string
          id?: string
          media_description?: string | null
          media_status?: string
          media_type?: string
          media_url?: string
          rejection_reason?: string | null
          story_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_media_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
        ]
      }
      updates: {
        Row: {
          content: string
          created_at: string
          created_by: string | null
          external_url: string | null
          id: string
          is_active: boolean | null
          title: string
          update_type: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by?: string | null
          external_url?: string | null
          id?: string
          is_active?: boolean | null
          title: string
          update_type?: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string | null
          external_url?: string | null
          id?: string
          is_active?: boolean | null
          title?: string
          update_type?: string
        }
        Relationships: []
      }
      user_presence: {
        Row: {
          anonymous_id: string | null
          id: string
          is_online: boolean | null
          last_seen: string
          user_id: string | null
        }
        Insert: {
          anonymous_id?: string | null
          id?: string
          is_online?: boolean | null
          last_seen?: string
          user_id?: string | null
        }
        Update: {
          anonymous_id?: string | null
          id?: string
          is_online?: boolean | null
          last_seen?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
