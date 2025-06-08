export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      api_usage_logs: {
        Row: {
          api_provider: string;
          cost_usd: number | null;
          created_at: string | null;
          endpoint: string | null;
          error_message: string | null;
          id: string;
          input_tokens: number | null;
          model_used: string;
          output_tokens: number | null;
          processing_time_ms: number | null;
          request_data: Json | null;
          response_data: Json | null;
          status: string | null;
          total_tokens: number | null;
          user_id: string | null;
        };
        Insert: {
          api_provider: string;
          cost_usd?: number | null;
          created_at?: string | null;
          endpoint?: string | null;
          error_message?: string | null;
          id?: string;
          input_tokens?: number | null;
          model_used: string;
          output_tokens?: number | null;
          processing_time_ms?: number | null;
          request_data?: Json | null;
          response_data?: Json | null;
          status?: string | null;
          total_tokens?: number | null;
          user_id?: string | null;
        };
        Update: {
          api_provider?: string;
          cost_usd?: number | null;
          created_at?: string | null;
          endpoint?: string | null;
          error_message?: string | null;
          id?: string;
          input_tokens?: number | null;
          model_used?: string;
          output_tokens?: number | null;
          processing_time_ms?: number | null;
          request_data?: Json | null;
          response_data?: Json | null;
          status?: string | null;
          total_tokens?: number | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
      dream_analytics: {
        Row: {
          analysis_period_end: string;
          analysis_period_start: string;
          average_story_length: string | null;
          created_at: string | null;
          emotion_distribution: Json | null;
          generated_at: string | null;
          id: string;
          most_common_emotion: string | null;
          most_used_tags: string[] | null;
          preferred_genres: Json | null;
          tag_frequency: Json | null;
          total_dreams_count: number | null;
          user_id: string;
        };
        Insert: {
          analysis_period_end: string;
          analysis_period_start: string;
          average_story_length?: string | null;
          created_at?: string | null;
          emotion_distribution?: Json | null;
          generated_at?: string | null;
          id?: string;
          most_common_emotion?: string | null;
          most_used_tags?: string[] | null;
          preferred_genres?: Json | null;
          tag_frequency?: Json | null;
          total_dreams_count?: number | null;
          user_id: string;
        };
        Update: {
          analysis_period_end?: string;
          analysis_period_start?: string;
          average_story_length?: string | null;
          created_at?: string | null;
          emotion_distribution?: Json | null;
          generated_at?: string | null;
          id?: string;
          most_common_emotion?: string | null;
          most_used_tags?: string[] | null;
          preferred_genres?: Json | null;
          tag_frequency?: Json | null;
          total_dreams_count?: number | null;
          user_id?: string;
        };
        Relationships: [];
      };
      dream_feedback: {
        Row: {
          created_at: string | null;
          dream_id: string;
          feedback_text: string | null;
          id: string;
          improvement_suggestions: string | null;
          story_creativity_rating: number | null;
          story_quality_rating: number | null;
          story_relevance_rating: number | null;
          user_id: string;
          want_different_version: boolean | null;
          would_recommend: boolean | null;
        };
        Insert: {
          created_at?: string | null;
          dream_id: string;
          feedback_text?: string | null;
          id?: string;
          improvement_suggestions?: string | null;
          story_creativity_rating?: number | null;
          story_quality_rating?: number | null;
          story_relevance_rating?: number | null;
          user_id: string;
          want_different_version?: boolean | null;
          would_recommend?: boolean | null;
        };
        Update: {
          created_at?: string | null;
          dream_id?: string;
          feedback_text?: string | null;
          id?: string;
          improvement_suggestions?: string | null;
          story_creativity_rating?: number | null;
          story_quality_rating?: number | null;
          story_relevance_rating?: number | null;
          user_id?: string;
          want_different_version?: boolean | null;
          would_recommend?: boolean | null;
        };
        Relationships: [
          {
            foreignKeyName: "dream_feedback_dream_id_fkey";
            columns: ["dream_id"];
            isOneToOne: false;
            referencedRelation: "dreams";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "dream_feedback_dream_id_fkey";
            columns: ["dream_id"];
            isOneToOne: false;
            referencedRelation: "dreams_with_details";
            referencedColumns: ["id"];
          }
        ];
      };
      dream_tags: {
        Row: {
          created_at: string | null;
          dream_id: string;
          tag_id: string;
        };
        Insert: {
          created_at?: string | null;
          dream_id: string;
          tag_id: string;
        };
        Update: {
          created_at?: string | null;
          dream_id?: string;
          tag_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "dream_tags_dream_id_fkey";
            columns: ["dream_id"];
            isOneToOne: false;
            referencedRelation: "dreams";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "dream_tags_dream_id_fkey";
            columns: ["dream_id"];
            isOneToOne: false;
            referencedRelation: "dreams_with_details";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "dream_tags_tag_id_fkey";
            columns: ["tag_id"];
            isOneToOne: false;
            referencedRelation: "tags";
            referencedColumns: ["id"];
          }
        ];
      };
      dreams: {
        Row: {
          created_at: string | null;
          dream_characters: string[] | null;
          dream_emotion: string | null;
          dream_input_text: string;
          dream_keywords: string[] | null;
          dream_objects: string[] | null;
          generated_at: string | null;
          generated_image_prompt: string | null;
          generated_image_url: string | null;
          generated_story_content: string | null;
          generated_story_title: string | null;
          generation_model: string | null;
          generation_parameters: Json | null;
          id: string;
          is_favorite: boolean | null;
          is_public: boolean | null;
          processing_status: string | null;
          raw_gemini_response: Json | null;
          story_preference_genre: string | null;
          story_preference_length: string | null;
          story_preference_mood: string | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          dream_characters?: string[] | null;
          dream_emotion?: string | null;
          dream_input_text: string;
          dream_keywords?: string[] | null;
          dream_objects?: string[] | null;
          generated_at?: string | null;
          generated_image_prompt?: string | null;
          generated_image_url?: string | null;
          generated_story_content?: string | null;
          generated_story_title?: string | null;
          generation_model?: string | null;
          generation_parameters?: Json | null;
          id?: string;
          is_favorite?: boolean | null;
          is_public?: boolean | null;
          processing_status?: string | null;
          raw_gemini_response?: Json | null;
          story_preference_genre?: string | null;
          story_preference_length?: string | null;
          story_preference_mood?: string | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          dream_characters?: string[] | null;
          dream_emotion?: string | null;
          dream_input_text?: string;
          dream_keywords?: string[] | null;
          dream_objects?: string[] | null;
          generated_at?: string | null;
          generated_image_prompt?: string | null;
          generated_image_url?: string | null;
          generated_story_content?: string | null;
          generated_story_title?: string | null;
          generation_model?: string | null;
          generation_parameters?: Json | null;
          id?: string;
          is_favorite?: boolean | null;
          is_public?: boolean | null;
          processing_status?: string | null;
          raw_gemini_response?: Json | null;
          story_preference_genre?: string | null;
          story_preference_length?: string | null;
          story_preference_mood?: string | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      tags: {
        Row: {
          category: string | null;
          color: string | null;
          created_at: string | null;
          id: string;
          name: string;
          usage_count: number | null;
        };
        Insert: {
          category?: string | null;
          color?: string | null;
          created_at?: string | null;
          id?: string;
          name: string;
          usage_count?: number | null;
        };
        Update: {
          category?: string | null;
          color?: string | null;
          created_at?: string | null;
          id?: string;
          name?: string;
          usage_count?: number | null;
        };
        Relationships: [];
      };
      user_profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string | null;
          default_language: string | null;
          display_name: string | null;
          id: string;
          notifications_enabled: boolean | null;
          preferred_story_genre: string | null;
          preferred_story_length: string | null;
          timezone: string | null;
          updated_at: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string | null;
          default_language?: string | null;
          display_name?: string | null;
          id: string;
          notifications_enabled?: boolean | null;
          preferred_story_genre?: string | null;
          preferred_story_length?: string | null;
          timezone?: string | null;
          updated_at?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string | null;
          default_language?: string | null;
          display_name?: string | null;
          id?: string;
          notifications_enabled?: boolean | null;
          preferred_story_genre?: string | null;
          preferred_story_length?: string | null;
          timezone?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      dreams_with_details: {
        Row: {
          avg_quality_rating: number | null;
          created_at: string | null;
          dream_characters: string[] | null;
          dream_emotion: string | null;
          dream_input_text: string | null;
          dream_keywords: string[] | null;
          dream_objects: string[] | null;
          feedback_count: number | null;
          generated_at: string | null;
          generated_image_prompt: string | null;
          generated_image_url: string | null;
          generated_story_content: string | null;
          generated_story_title: string | null;
          generation_model: string | null;
          generation_parameters: Json | null;
          id: string | null;
          is_favorite: boolean | null;
          is_public: boolean | null;
          processing_status: string | null;
          raw_gemini_response: Json | null;
          story_preference_genre: string | null;
          story_preference_length: string | null;
          story_preference_mood: string | null;
          tag_categories: string[] | null;
          tag_names: string[] | null;
          updated_at: string | null;
          user_display_name: string | null;
          user_id: string | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      create_or_get_tag: {
        Args: { tag_name: string; tag_category?: string; tag_color?: string };
        Returns: string;
      };
      get_popular_tags: {
        Args: { limit_count?: number };
        Returns: {
          tag_name: string;
          category: string;
          usage_count: number;
          color: string;
        }[];
      };
      get_user_dream_stats: {
        Args: { user_uuid: string };
        Returns: Json;
      };
      search_dreams: {
        Args: {
          user_uuid: string;
          search_query?: string;
          tag_filter?: string[];
          emotion_filter?: string;
          limit_count?: number;
          offset_count?: number;
        };
        Returns: {
          avg_quality_rating: number | null;
          created_at: string | null;
          dream_characters: string[] | null;
          dream_emotion: string | null;
          dream_input_text: string | null;
          dream_keywords: string[] | null;
          dream_objects: string[] | null;
          feedback_count: number | null;
          generated_at: string | null;
          generated_image_prompt: string | null;
          generated_image_url: string | null;
          generated_story_content: string | null;
          generated_story_title: string | null;
          generation_model: string | null;
          generation_parameters: Json | null;
          id: string | null;
          is_favorite: boolean | null;
          is_public: boolean | null;
          processing_status: string | null;
          raw_gemini_response: Json | null;
          story_preference_genre: string | null;
          story_preference_length: string | null;
          story_preference_mood: string | null;
          tag_categories: string[] | null;
          tag_names: string[] | null;
          updated_at: string | null;
          user_display_name: string | null;
          user_id: string | null;
        }[];
      };
      suggest_tags_for_dream: {
        Args: { dream_text: string };
        Returns: string[];
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DefaultSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
      DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
      DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;

// Additional types for AI Dream Diary
export interface DreamRequest {
  dream_input_text: string;
  dream_keywords?: string[];
  dream_emotion?: string;
  dream_characters?: string[];
  dream_objects?: string[];
  story_preference_genre?: string;
  story_preference_length?: string;
  story_preference_mood?: string;
}

export interface GeneratedStory {
  title: string;
  story: string;
  image_suggestion: string;
}

export interface DreamResponse {
  success: boolean;
  data?: {
    id: string;
    title: string;
    story: string;
    image_suggestion: string;
    created_at: string;
    processing_time_ms: number;
  };
  error?: string;
}

export interface UserAnalytics {
  total_dreams: number;
  completed_dreams: number;
  favorite_dreams: number;
  most_common_emotion: string | null;
  dreams_this_month: number;
  dreams_this_week: number;
  avg_dreams_per_week: number;
  emotion_trends: Record<string, number>;
  genre_preferences: Record<string, number>;
  weekly_activity: Array<{
    week: string;
    dreams: number;
    startDate: string;
    endDate: string;
  }>;
  processing_success_rate: number;
  top_tags: Array<{
    name: string;
    count: number;
  }>;
  insights: {
    most_active_emotion: string | null;
    favorite_genre: string | null;
    consistency_score: number;
    tag_diversity: number;
  };
  preferences: {
    default_genre: string;
    default_length: string;
    language: string;
    notifications: boolean;
  };
}

// 추가 타입 정의

// DreamRecord는 실제로 dreams_with_details 뷰에서 가져오는 데이터 타입
export type DreamRecord = Tables<"dreams_with_details">;

// 기본 Dreams 테이블 타입 (INSERT/UPDATE용)
export type DreamTable = Tables<"dreams">;

// 다른 테이블 타입들
export type TagRecord = Tables<"tags">;
export type UserProfile = Tables<"user_profiles">;

// Edge Function 응답 타입들
export interface DreamsListResponse {
  dreams: DreamRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// API 응답 래퍼 타입 (lib/api.ts에서 사용)
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}
