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
      kb_articles: {
        Row: {
          author_id: string | null
          content: string
          created_at: string | null
          id: string
          kb_status: string
          published_at: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          author_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          kb_status?: string
          published_at?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          kb_status?: string
          published_at?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kb_articles_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          created_at: string | null
          organization_id: string
          organization_role: Database["public"]["Enums"]["organization_role"]
          profile_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          organization_id: string
          organization_role?: Database["public"]["Enums"]["organization_role"]
          profile_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          organization_id?: string
          organization_role?: Database["public"]["Enums"]["organization_role"]
          profile_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      tags: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      templates: {
        Row: {
          content: string
          created_at: string | null
          created_by: string | null
          id: string
          organization_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          organization_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          organization_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_assignments: {
        Row: {
          created_at: string | null
          id: string
          is_primary: boolean | null
          organization_id: string | null
          ticket_id: string | null
          updated_at: string | null
          worker_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          organization_id?: string | null
          ticket_id?: string | null
          updated_at?: string | null
          worker_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          organization_id?: string | null
          ticket_id?: string | null
          updated_at?: string | null
          worker_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ticket_assignments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_assignments_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_assignments_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_attachments: {
        Row: {
          created_at: string | null
          file_name: string
          file_size: number | null
          file_type: string | null
          id: string
          message_id: string | null
          storage_path: string
          ticket_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          file_name: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          message_id?: string | null
          storage_path: string
          ticket_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          message_id?: string | null
          storage_path?: string
          ticket_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ticket_attachments_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "ticket_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_attachments_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_feedback: {
        Row: {
          comment: string | null
          created_at: string | null
          id: string
          rating: number
          ticket_id: string
          updated_at: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          id?: string
          rating: number
          ticket_id: string
          updated_at?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          id?: string
          rating?: number
          ticket_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ticket_feedback_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_messages: {
        Row: {
          content: Json
          content_format: string
          created_at: string | null
          id: string
          is_internal: boolean | null
          sender_id: string | null
          sender_type: string
          ticket_id: string
          updated_at: string | null
        }
        Insert: {
          content: Json
          content_format?: string
          created_at?: string | null
          id?: string
          is_internal?: boolean | null
          sender_id?: string | null
          sender_type: string
          ticket_id: string
          updated_at?: string | null
        }
        Update: {
          content?: Json
          content_format?: string
          created_at?: string | null
          id?: string
          is_internal?: boolean | null
          sender_id?: string | null
          sender_type?: string
          ticket_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ticket_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_tags: {
        Row: {
          created_at: string | null
          tag_id: string
          ticket_id: string
        }
        Insert: {
          created_at?: string | null
          tag_id: string
          ticket_id: string
        }
        Update: {
          created_at?: string | null
          tag_id?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_tags_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          created_at: string | null
          created_by_id: string | null
          created_by_type: string
          custom_fields: Json | null
          due_date: string | null
          external_reference_id: string | null
          first_response_at: string | null
          id: string
          integration_metadata: Json | null
          metadata: Json | null
          organization_id: string | null
          resolved_at: string | null
          ticket_priority: Database["public"]["Enums"]["ticket_priority"]
          ticket_source: Database["public"]["Enums"]["ticket_source"]
          ticket_status: Database["public"]["Enums"]["ticket_status"]
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          created_by_id?: string | null
          created_by_type: string
          custom_fields?: Json | null
          due_date?: string | null
          external_reference_id?: string | null
          first_response_at?: string | null
          id?: string
          integration_metadata?: Json | null
          metadata?: Json | null
          organization_id?: string | null
          resolved_at?: string | null
          ticket_priority?: Database["public"]["Enums"]["ticket_priority"]
          ticket_source?: Database["public"]["Enums"]["ticket_source"]
          ticket_status?: Database["public"]["Enums"]["ticket_status"]
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          created_by_id?: string | null
          created_by_type?: string
          custom_fields?: Json | null
          due_date?: string | null
          external_reference_id?: string | null
          first_response_at?: string | null
          id?: string
          integration_metadata?: Json | null
          metadata?: Json | null
          organization_id?: string | null
          resolved_at?: string | null
          ticket_priority?: Database["public"]["Enums"]["ticket_priority"]
          ticket_source?: Database["public"]["Enums"]["ticket_source"]
          ticket_status?: Database["public"]["Enums"]["ticket_status"]
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tickets_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_notes: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          organization_id: string
          updated_at: string | null
          updated_by: string | null
          user_id: string
          user_notes: Json | null
          user_tags: Json | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          organization_id: string
          updated_at?: string | null
          updated_by?: string | null
          user_id: string
          user_notes?: Json | null
          user_tags?: Json | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          organization_id?: string
          updated_at?: string | null
          updated_by?: string | null
          user_id?: string
          user_notes?: Json | null
          user_tags?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "user_notes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_notes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_notes_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_notes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          auth_provider: string | null
          avatar_url: string | null
          company: string | null
          created_at: string | null
          email: string
          external_id: string | null
          external_metadata: Json | null
          full_name: string | null
          id: string
          is_active: boolean | null
          last_login_at: string | null
          login_count: number | null
          metadata: Json | null
          preferences: Json | null
          updated_at: string | null
          user_status: Database["public"]["Enums"]["user_status"]
          user_type: string
        }
        Insert: {
          auth_provider?: string | null
          avatar_url?: string | null
          company?: string | null
          created_at?: string | null
          email: string
          external_id?: string | null
          external_metadata?: Json | null
          full_name?: string | null
          id: string
          is_active?: boolean | null
          last_login_at?: string | null
          login_count?: number | null
          metadata?: Json | null
          preferences?: Json | null
          updated_at?: string | null
          user_status?: Database["public"]["Enums"]["user_status"]
          user_type?: string
        }
        Update: {
          auth_provider?: string | null
          avatar_url?: string | null
          company?: string | null
          created_at?: string | null
          email?: string
          external_id?: string | null
          external_metadata?: Json | null
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          last_login_at?: string | null
          login_count?: number | null
          metadata?: Json | null
          preferences?: Json | null
          updated_at?: string | null
          user_status?: Database["public"]["Enums"]["user_status"]
          user_type?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_organization_admin: {
        Args: {
          user_id: string
          org_id: string
        }
        Returns: boolean
      }
      check_organization_membership: {
        Args: {
          user_id: string
          org_id: string
        }
        Returns: boolean
      }
      citext:
        | {
            Args: {
              "": boolean
            }
            Returns: string
          }
        | {
            Args: {
              "": string
            }
            Returns: string
          }
        | {
            Args: {
              "": unknown
            }
            Returns: string
          }
      citext_hash: {
        Args: {
          "": string
        }
        Returns: number
      }
      citextin: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      citextout: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      citextrecv: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      citextsend: {
        Args: {
          "": string
        }
        Returns: string
      }
      create_tiptap_content: {
        Args: {
          msg: string
        }
        Returns: Json
      }
      exec_sql: {
        Args: {
          sql_query: string
        }
        Returns: undefined
      }
      ticket_message_plaintext: {
        Args: {
          content: Json
        }
        Returns: string
      }
      user_notes_plaintext: {
        Args: {
          notes: Json
        }
        Returns: string
      }
    }
    Enums: {
      channel_type: "email" | "whatsapp" | "sms" | "web" | "telegram"
      organization_role: "admin" | "member" | "customer"
      ticket_priority: "low" | "medium" | "high" | "urgent"
      ticket_source:
        | "customer_portal"
        | "worker_portal"
        | "email"
        | "api"
        | "system"
      ticket_status: "new" | "open" | "pending" | "resolved" | "closed"
      user_status: "offline" | "online" | "away" | "transfers_only"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
