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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          created_at: string
          date: string | null
          description: string | null
          id: string
          profile_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          date?: string | null
          description?: string | null
          id?: string
          profile_id: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          date?: string | null
          description?: string | null
          id?: string
          profile_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "achievements_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      game_media: {
        Row: {
          caption: string | null
          created_at: string
          game_id: string
          id: string
          media_type: string
          sort_order: number
          thumbnail_url: string | null
          updated_at: string
          url: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          game_id: string
          id?: string
          media_type?: string
          sort_order?: number
          thumbnail_url?: string | null
          updated_at?: string
          url: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          game_id?: string
          id?: string
          media_type?: string
          sort_order?: number
          thumbnail_url?: string | null
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_media_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      games: {
        Row: {
          coach_notes: string | null
          created_at: string
          game_date: string
          id: string
          location: string | null
          mood: string | null
          opponent: string
          opponent_score: number | null
          performance_rating: number | null
          player_reflection: string | null
          profile_id: string
          result: string | null
          season: string | null
          sport: string
          stats: Json
          team_score: number | null
          updated_at: string
        }
        Insert: {
          coach_notes?: string | null
          created_at?: string
          game_date: string
          id?: string
          location?: string | null
          mood?: string | null
          opponent: string
          opponent_score?: number | null
          performance_rating?: number | null
          player_reflection?: string | null
          profile_id: string
          result?: string | null
          season?: string | null
          sport?: string
          stats?: Json
          team_score?: number | null
          updated_at?: string
        }
        Update: {
          coach_notes?: string | null
          created_at?: string
          game_date?: string
          id?: string
          location?: string | null
          mood?: string | null
          opponent?: string
          opponent_score?: number | null
          performance_rating?: number | null
          player_reflection?: string | null
          profile_id?: string
          result?: string | null
          season?: string | null
          sport?: string
          stats?: Json
          team_score?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "games_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      highlights: {
        Row: {
          caption: string | null
          category: string
          created_at: string
          highlight_date: string | null
          id: string
          is_public: boolean
          media_type: string
          profile_id: string
          proof_media_type: string | null
          proof_url: string | null
          reviewed_at: string | null
          reviewer_name: string | null
          sort_order: number
          submitted_for_review_at: string | null
          thumbnail_url: string | null
          title: string | null
          updated_at: string
          url: string
          verification_note: string | null
          verification_status: string
        }
        Insert: {
          caption?: string | null
          category?: string
          created_at?: string
          highlight_date?: string | null
          id?: string
          is_public?: boolean
          media_type?: string
          profile_id: string
          proof_media_type?: string | null
          proof_url?: string | null
          reviewed_at?: string | null
          reviewer_name?: string | null
          sort_order?: number
          submitted_for_review_at?: string | null
          thumbnail_url?: string | null
          title?: string | null
          updated_at?: string
          url: string
          verification_note?: string | null
          verification_status?: string
        }
        Update: {
          caption?: string | null
          category?: string
          created_at?: string
          highlight_date?: string | null
          id?: string
          is_public?: boolean
          media_type?: string
          profile_id?: string
          proof_media_type?: string | null
          proof_url?: string | null
          reviewed_at?: string | null
          reviewer_name?: string | null
          sort_order?: number
          submitted_for_review_at?: string | null
          thumbnail_url?: string | null
          title?: string | null
          updated_at?: string
          url?: string
          verification_note?: string | null
          verification_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "highlights_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_private_details: {
        Row: {
          academic_notes: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          guardian_name: string | null
          profile_id: string
          updated_at: string
        }
        Insert: {
          academic_notes?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          guardian_name?: string | null
          profile_id: string
          updated_at?: string
        }
        Update: {
          academic_notes?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          guardian_name?: string | null
          profile_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_private_details_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_unlock_links: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          label: string | null
          last_viewed_at: string | null
          profile_id: string
          revoked_at: string | null
          role: string
          token: string
          unlock_contact: boolean
          unlock_game_log: boolean
          unlock_highlights: boolean
          updated_at: string
          view_count: number
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          label?: string | null
          last_viewed_at?: string | null
          profile_id: string
          revoked_at?: string | null
          role: string
          token: string
          unlock_contact?: boolean
          unlock_game_log?: boolean
          unlock_highlights?: boolean
          updated_at?: string
          view_count?: number
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          label?: string | null
          last_viewed_at?: string | null
          profile_id?: string
          revoked_at?: string | null
          role?: string
          token?: string
          unlock_contact?: boolean
          unlock_game_log?: boolean
          unlock_highlights?: boolean
          updated_at?: string
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "profile_unlock_links_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          bio: string | null
          created_at: string
          dominant_hand: string | null
          first_name: string
          gpa: string | null
          graduation_year: string | null
          height: string | null
          id: string
          jersey_number: string | null
          last_name: string
          photo_url: string | null
          position: string | null
          slug: string
          sport: string
          team: string | null
          updated_at: string
          visibility: string
          weight: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string
          dominant_hand?: string | null
          first_name: string
          gpa?: string | null
          graduation_year?: string | null
          height?: string | null
          id?: string
          jersey_number?: string | null
          last_name: string
          photo_url?: string | null
          position?: string | null
          slug: string
          sport?: string
          team?: string | null
          updated_at?: string
          visibility?: string
          weight?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string
          dominant_hand?: string | null
          first_name?: string
          gpa?: string | null
          graduation_year?: string | null
          height?: string | null
          id?: string
          jersey_number?: string | null
          last_name?: string
          photo_url?: string | null
          position?: string | null
          slug?: string
          sport?: string
          team?: string | null
          updated_at?: string
          visibility?: string
          weight?: string | null
        }
        Relationships: []
      }
      season_stats: {
        Row: {
          assists: number | null
          batting_average: number | null
          clean_sheets: number | null
          created_at: string
          era: number | null
          fouls: number | null
          games_played: number | null
          goals: number | null
          headers_won: number | null
          hits: number | null
          home_runs: number | null
          id: string
          interceptions: number | null
          minutes_played: number | null
          mvp_awards: number | null
          pass_completion: number | null
          penalty_kicks: number | null
          pk_saves: number | null
          profile_id: string
          rbi: number | null
          red_cards: number | null
          saves: number | null
          season: string
          shots: number | null
          shots_on_goal: number | null
          sport: string
          stolen_bases: number | null
          strikeouts: number | null
          tackles: number | null
          updated_at: string
          wins: number | null
          yellow_cards: number | null
        }
        Insert: {
          assists?: number | null
          batting_average?: number | null
          clean_sheets?: number | null
          created_at?: string
          era?: number | null
          fouls?: number | null
          games_played?: number | null
          goals?: number | null
          headers_won?: number | null
          hits?: number | null
          home_runs?: number | null
          id?: string
          interceptions?: number | null
          minutes_played?: number | null
          mvp_awards?: number | null
          pass_completion?: number | null
          penalty_kicks?: number | null
          pk_saves?: number | null
          profile_id: string
          rbi?: number | null
          red_cards?: number | null
          saves?: number | null
          season: string
          shots?: number | null
          shots_on_goal?: number | null
          sport?: string
          stolen_bases?: number | null
          strikeouts?: number | null
          tackles?: number | null
          updated_at?: string
          wins?: number | null
          yellow_cards?: number | null
        }
        Update: {
          assists?: number | null
          batting_average?: number | null
          clean_sheets?: number | null
          created_at?: string
          era?: number | null
          fouls?: number | null
          games_played?: number | null
          goals?: number | null
          headers_won?: number | null
          hits?: number | null
          home_runs?: number | null
          id?: string
          interceptions?: number | null
          minutes_played?: number | null
          mvp_awards?: number | null
          pass_completion?: number | null
          penalty_kicks?: number | null
          pk_saves?: number | null
          profile_id?: string
          rbi?: number | null
          red_cards?: number | null
          saves?: number | null
          season?: string
          shots?: number | null
          shots_on_goal?: number | null
          sport?: string
          stolen_bases?: number | null
          strikeouts?: number | null
          tackles?: number | null
          updated_at?: string
          wins?: number | null
          yellow_cards?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "season_stats_profile_id_fkey"
            columns: ["profile_id"]
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
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
