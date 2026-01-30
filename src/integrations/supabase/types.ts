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
      alert_settings: {
        Row: {
          created_at: string
          email_address: string | null
          email_enabled: boolean
          id: string
          in_app_enabled: boolean
          updated_at: string
          user_id: string
          whatsapp_enabled: boolean
          whatsapp_number: string | null
        }
        Insert: {
          created_at?: string
          email_address?: string | null
          email_enabled?: boolean
          id?: string
          in_app_enabled?: boolean
          updated_at?: string
          user_id: string
          whatsapp_enabled?: boolean
          whatsapp_number?: string | null
        }
        Update: {
          created_at?: string
          email_address?: string | null
          email_enabled?: boolean
          id?: string
          in_app_enabled?: boolean
          updated_at?: string
          user_id?: string
          whatsapp_enabled?: boolean
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      business_submissions: {
        Row: {
          business_name: string
          category: string
          description: string | null
          id: string
          product_images: string[] | null
          reviewed_at: string | null
          reviewer_notes: string | null
          status: string
          submitted_at: string
          whatsapp_number: string
        }
        Insert: {
          business_name: string
          category: string
          description?: string | null
          id?: string
          product_images?: string[] | null
          reviewed_at?: string | null
          reviewer_notes?: string | null
          status?: string
          submitted_at?: string
          whatsapp_number: string
        }
        Update: {
          business_name?: string
          category?: string
          description?: string | null
          id?: string
          product_images?: string[] | null
          reviewed_at?: string | null
          reviewer_notes?: string | null
          status?: string
          submitted_at?: string
          whatsapp_number?: string
        }
        Relationships: []
      }
      businesses: {
        Row: {
          active: boolean
          category: string
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
          verified: boolean
          whatsapp_number: string
        }
        Insert: {
          active?: boolean
          category: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
          verified?: boolean
          whatsapp_number: string
        }
        Update: {
          active?: boolean
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
          verified?: boolean
          whatsapp_number?: string
        }
        Relationships: []
      }
      fetched_content: {
        Row: {
          content_hash: string | null
          error_message: string | null
          fetched_at: string
          id: string
          raw_text: string | null
          source_id: string
          source_url: string
          status: string
        }
        Insert: {
          content_hash?: string | null
          error_message?: string | null
          fetched_at?: string
          id?: string
          raw_text?: string | null
          source_id: string
          source_url: string
          status?: string
        }
        Update: {
          content_hash?: string | null
          error_message?: string | null
          fetched_at?: string
          id?: string
          raw_text?: string | null
          source_id?: string
          source_url?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "fetched_content_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      keywords: {
        Row: {
          category: Database["public"]["Enums"]["keyword_category"]
          created_at: string
          id: string
          keyword: string
        }
        Insert: {
          category: Database["public"]["Enums"]["keyword_category"]
          created_at?: string
          id?: string
          keyword: string
        }
        Update: {
          category?: Database["public"]["Enums"]["keyword_category"]
          created_at?: string
          id?: string
          keyword?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          confidence_score: number | null
          created_at: string
          fetched_content_id: string | null
          id: string
          matched_keywords: string[]
          notified: boolean
          snippet: string
          source_id: string | null
          source_url: string
          status: string
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string
          fetched_content_id?: string | null
          id?: string
          matched_keywords?: string[]
          notified?: boolean
          snippet: string
          source_id?: string | null
          source_url: string
          status?: string
        }
        Update: {
          confidence_score?: number | null
          created_at?: string
          fetched_content_id?: string | null
          id?: string
          matched_keywords?: string[]
          notified?: boolean
          snippet?: string
          source_id?: string | null
          source_url?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_fetched_content_id_fkey"
            columns: ["fetched_content_id"]
            isOneToOne: false
            referencedRelation: "fetched_content"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          lead_id: string | null
          message: string
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          lead_id?: string | null
          message: string
          read?: boolean
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          lead_id?: string | null
          message?: string
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          active: boolean
          business_id: string
          caption: string | null
          created_at: string
          id: string
          media_url: string
          price: number
          product_images: string[] | null
          product_name: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          business_id: string
          caption?: string | null
          created_at?: string
          id?: string
          media_url: string
          price: number
          product_images?: string[] | null
          product_name: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          business_id?: string
          caption?: string | null
          created_at?: string
          id?: string
          media_url?: string
          price?: number
          product_images?: string[] | null
          product_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      sources: {
        Row: {
          active: boolean
          created_at: string
          id: string
          name: string
          source_type: Database["public"]["Enums"]["source_type"]
          updated_at: string
          url: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          name: string
          source_type: Database["public"]["Enums"]["source_type"]
          updated_at?: string
          url: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          name?: string
          source_type?: Database["public"]["Enums"]["source_type"]
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
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
      app_role: "admin" | "user"
      keyword_category: "product" | "intent" | "location"
      source_type: "forum" | "listing" | "group" | "website"
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
      app_role: ["admin", "user"],
      keyword_category: ["product", "intent", "location"],
      source_type: ["forum", "listing", "group", "website"],
    },
  },
} as const
