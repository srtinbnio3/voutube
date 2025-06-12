export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      channels: {
        Row: {
          created_at: string
          description: string | null
          icon_url: string | null
          id: string
          last_ownership_check_at: string | null
          latest_post_at: string | null
          name: string
          owner_user_id: string | null
          ownership_verification_expires_at: string | null
          ownership_verification_method: string | null
          ownership_verified_at: string | null
          post_count: number | null
          subscriber_count: number | null
          updated_at: string
          youtube_channel_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon_url?: string | null
          id?: string
          last_ownership_check_at?: string | null
          latest_post_at?: string | null
          name: string
          owner_user_id?: string | null
          ownership_verification_expires_at?: string | null
          ownership_verification_method?: string | null
          ownership_verified_at?: string | null
          post_count?: number | null
          subscriber_count?: number | null
          updated_at?: string
          youtube_channel_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon_url?: string | null
          id?: string
          last_ownership_check_at?: string | null
          latest_post_at?: string | null
          name?: string
          owner_user_id?: string | null
          ownership_verification_expires_at?: string | null
          ownership_verification_method?: string | null
          ownership_verified_at?: string | null
          post_count?: number | null
          subscriber_count?: number | null
          updated_at?: string
          youtube_channel_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "channels_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          content: string
          created_at: string
          id: string
          mentioned_username: string | null
          parent_id: string | null
          post_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          mentioned_username?: string | null
          parent_id?: string | null
          post_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          mentioned_username?: string | null
          parent_id?: string | null
          post_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_rewards: {
        Row: {
          amount: number
          campaign_id: string
          created_at: string
          id: string
          payment_date: string | null
          payment_status: string
          updated_at: string
        }
        Insert: {
          amount: number
          campaign_id: string
          created_at?: string
          id?: string
          payment_date?: string | null
          payment_status: string
          updated_at?: string
        }
        Update: {
          amount?: number
          campaign_id?: string
          created_at?: string
          id?: string
          payment_date?: string | null
          payment_status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "creator_rewards_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "crowdfunding_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      crowdfunding_campaigns: {
        Row: {
          bank_account_info: Json | null
          channel_id: string
          created_at: string
          current_amount: number | null
          description: string
          end_date: string
          id: string
          post_id: string
          reward_enabled: boolean | null
          start_date: string
          status: string
          target_amount: number
          title: string
          updated_at: string
        }
        Insert: {
          bank_account_info?: Json | null
          channel_id: string
          created_at?: string
          current_amount?: number | null
          description: string
          end_date: string
          id?: string
          post_id: string
          reward_enabled?: boolean | null
          start_date: string
          status: string
          target_amount: number
          title: string
          updated_at?: string
        }
        Update: {
          bank_account_info?: Json | null
          channel_id?: string
          created_at?: string
          current_amount?: number | null
          description?: string
          end_date?: string
          id?: string
          post_id?: string
          reward_enabled?: boolean | null
          start_date?: string
          status?: string
          target_amount?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crowdfunding_campaigns_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crowdfunding_campaigns_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      crowdfunding_payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          status: string
          stripe_customer_id: string
          stripe_payment_intent_id: string
          supporter_id: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          status: string
          stripe_customer_id: string
          stripe_payment_intent_id: string
          supporter_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          status?: string
          stripe_customer_id?: string
          stripe_payment_intent_id?: string
          supporter_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crowdfunding_payments_supporter_id_fkey"
            columns: ["supporter_id"]
            isOneToOne: false
            referencedRelation: "crowdfunding_supporters"
            referencedColumns: ["id"]
          },
        ]
      }
      crowdfunding_rewards: {
        Row: {
          amount: number
          campaign_id: string
          created_at: string
          description: string
          id: string
          quantity: number
          remaining_quantity: number
          title: string
          updated_at: string
        }
        Insert: {
          amount: number
          campaign_id: string
          created_at?: string
          description: string
          id?: string
          quantity: number
          remaining_quantity: number
          title: string
          updated_at?: string
        }
        Update: {
          amount?: number
          campaign_id?: string
          created_at?: string
          description?: string
          id?: string
          quantity?: number
          remaining_quantity?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crowdfunding_rewards_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "crowdfunding_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      crowdfunding_supporters: {
        Row: {
          amount: number
          campaign_id: string
          created_at: string
          id: string
          payment_status: string
          reward_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          campaign_id: string
          created_at?: string
          id?: string
          payment_status: string
          reward_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          campaign_id?: string
          created_at?: string
          id?: string
          payment_status?: string
          reward_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crowdfunding_supporters_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "crowdfunding_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crowdfunding_supporters_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "crowdfunding_rewards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crowdfunding_supporters_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          channel_id: string
          created_at: string
          description: string
          id: string
          score: number | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          channel_id: string
          created_at?: string
          description: string
          id?: string
          score?: number | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          channel_id?: string
          created_at?: string
          description?: string
          id?: string
          score?: number | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          updated_at: string
          user_handle: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id: string
          updated_at?: string
          user_handle: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          updated_at?: string
          user_handle?: string
          username?: string
        }
        Relationships: []
      }
      votes: {
        Row: {
          created_at: string
          id: string
          is_upvote: boolean
          post_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_upvote: boolean
          post_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_upvote?: boolean
          post_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "votes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_connection_count: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_db_size: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_slow_queries: {
        Args: Record<PropertyKey, never>
        Returns: {
          query: string
          calls: number
          avg_time: number
          max_time: number
          avg_rows: number
        }[]
      }
      get_table_row_counts: {
        Args: Record<PropertyKey, never>
        Returns: {
          table_name: string
          row_count: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
