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
      api_integrations: {
        Row: {
          api_key: string
          created_at: string | null
          id: string
          name: string
          permissions: Json | null
          rate_limit: number | null
          status: string
          updated_at: string | null
        }
        Insert: {
          api_key: string
          created_at?: string | null
          id?: string
          name: string
          permissions?: Json | null
          rate_limit?: number | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          api_key?: string
          created_at?: string | null
          id?: string
          name?: string
          permissions?: Json | null
          rate_limit?: number | null
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      customer_accounts: {
        Row: {
          created_at: string | null
          customer_id: string | null
          id: string
          last_login_at: string | null
          login_count: number | null
          metadata: Json | null
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          customer_id?: string | null
          id: string
          last_login_at?: string | null
          login_count?: number | null
          metadata?: Json | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string | null
          id?: string
          last_login_at?: string | null
          login_count?: number | null
          metadata?: Json | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_accounts_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_channel_preferences: {
        Row: {
          channel_id: string
          created_at: string | null
          customer_id: string
          notification_enabled: boolean | null
          priority_threshold:
            | Database["public"]["Enums"]["ticket_priority"]
            | null
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          updated_at: string | null
        }
        Insert: {
          channel_id: string
          created_at?: string | null
          customer_id: string
          notification_enabled?: boolean | null
          priority_threshold?:
            | Database["public"]["Enums"]["ticket_priority"]
            | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          updated_at?: string | null
        }
        Update: {
          channel_id?: string
          created_at?: string | null
          customer_id?: string
          notification_enabled?: boolean | null
          priority_threshold?:
            | Database["public"]["Enums"]["ticket_priority"]
            | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_channel_preferences_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "customer_channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_channel_preferences_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_channels: {
        Row: {
          channel_type: Database["public"]["Enums"]["channel_type"]
          created_at: string | null
          customer_id: string | null
          id: string
          identifier: string
          is_primary: boolean | null
          metadata: Json | null
          updated_at: string | null
          verification_code: string | null
          verification_expires_at: string | null
          verified: boolean | null
        }
        Insert: {
          channel_type: Database["public"]["Enums"]["channel_type"]
          created_at?: string | null
          customer_id?: string | null
          id?: string
          identifier: string
          is_primary?: boolean | null
          metadata?: Json | null
          updated_at?: string | null
          verification_code?: string | null
          verification_expires_at?: string | null
          verified?: boolean | null
        }
        Update: {
          channel_type?: Database["public"]["Enums"]["channel_type"]
          created_at?: string | null
          customer_id?: string | null
          id?: string
          identifier?: string
          is_primary?: boolean | null
          metadata?: Json | null
          updated_at?: string | null
          verification_code?: string | null
          verification_expires_at?: string | null
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_channels_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_organization_members: {
        Row: {
          created_at: string | null
          customer_id: string
          organization_id: string
          role: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          customer_id: string
          organization_id: string
          role?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string
          organization_id?: string
          role?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_organization_members_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "customer_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_organizations: {
        Row: {
          created_at: string | null
          domain: string | null
          id: string
          name: string
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          domain?: string | null
          id?: string
          name: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          domain?: string | null
          id?: string
          name?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      customer_permissions: {
        Row: {
          created_at: string | null
          customer_id: string | null
          id: string
          permission: string
          resource_id: string | null
          resource_type: string
        }
        Insert: {
          created_at?: string | null
          customer_id?: string | null
          id?: string
          permission: string
          resource_id?: string | null
          resource_type: string
        }
        Update: {
          created_at?: string | null
          customer_id?: string | null
          id?: string
          permission?: string
          resource_id?: string | null
          resource_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_permissions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          auth_provider: string | null
          company: string | null
          created_at: string | null
          email: string
          external_id: string | null
          external_metadata: Json | null
          full_name: string | null
          id: string
          metadata: Json | null
          organization_id: string | null
          preferences: Json | null
          type: string
          updated_at: string | null
        }
        Insert: {
          auth_provider?: string | null
          company?: string | null
          created_at?: string | null
          email: string
          external_id?: string | null
          external_metadata?: Json | null
          full_name?: string | null
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          preferences?: Json | null
          type?: string
          updated_at?: string | null
        }
        Update: {
          auth_provider?: string | null
          company?: string | null
          created_at?: string | null
          email?: string
          external_id?: string | null
          external_metadata?: Json | null
          full_name?: string | null
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          preferences?: Json | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "customer_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      kb_articles: {
        Row: {
          author_id: string | null
          content: string
          created_at: string | null
          id: string
          published_at: string | null
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          author_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          published_at?: string | null
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          published_at?: string | null
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kb_articles_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
          is_active: boolean | null
          role: string
          status: Database["public"]["Enums"]["user_status"]
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          is_active?: boolean | null
          role?: string
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          role?: string
          status?: Database["public"]["Enums"]["user_status"]
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
      team_members: {
        Row: {
          created_at: string | null
          profile_id: string | null
          role_in_team: string
          team_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          profile_id?: string | null
          role_in_team?: string
          team_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          profile_id?: string | null
          role_in_team?: string
          team_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_members_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
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
      templates: {
        Row: {
          content: string
          created_at: string | null
          created_by: string | null
          id: string
          team_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          team_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          team_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "templates_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_assignments: {
        Row: {
          agent_id: string | null
          created_at: string | null
          id: string
          is_primary: boolean | null
          team_id: string | null
          ticket_id: string | null
          updated_at: string | null
        }
        Insert: {
          agent_id?: string | null
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          team_id?: string | null
          ticket_id?: string | null
          updated_at?: string | null
        }
        Update: {
          agent_id?: string | null
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          team_id?: string | null
          ticket_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ticket_assignments_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_assignments_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_assignments_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
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
          channel_id: string | null
          content: string
          created_at: string | null
          id: string
          is_internal: boolean | null
          sender_id: string | null
          sender_type: string
          ticket_id: string
          updated_at: string | null
        }
        Insert: {
          channel_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          is_internal?: boolean | null
          sender_id?: string | null
          sender_type: string
          ticket_id: string
          updated_at?: string | null
        }
        Update: {
          channel_id?: string | null
          content?: string
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
            foreignKeyName: "ticket_messages_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "customer_channels"
            referencedColumns: ["id"]
          },
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
          customer_id: string
          due_date: string | null
          external_reference_id: string | null
          first_response_at: string | null
          id: string
          integration_id: string | null
          integration_metadata: Json | null
          metadata: Json | null
          priority: Database["public"]["Enums"]["ticket_priority"]
          resolved_at: string | null
          source: Database["public"]["Enums"]["ticket_source"]
          status: Database["public"]["Enums"]["ticket_status"]
          team_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by_id?: string | null
          created_by_type: string
          custom_fields?: Json | null
          customer_id: string
          due_date?: string | null
          external_reference_id?: string | null
          first_response_at?: string | null
          id?: string
          integration_id?: string | null
          integration_metadata?: Json | null
          metadata?: Json | null
          priority?: Database["public"]["Enums"]["ticket_priority"]
          resolved_at?: string | null
          source?: Database["public"]["Enums"]["ticket_source"]
          status?: Database["public"]["Enums"]["ticket_status"]
          team_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by_id?: string | null
          created_by_type?: string
          custom_fields?: Json | null
          customer_id?: string
          due_date?: string | null
          external_reference_id?: string | null
          first_response_at?: string | null
          id?: string
          integration_id?: string | null
          integration_metadata?: Json | null
          metadata?: Json | null
          priority?: Database["public"]["Enums"]["ticket_priority"]
          resolved_at?: string | null
          source?: Database["public"]["Enums"]["ticket_source"]
          status?: Database["public"]["Enums"]["ticket_status"]
          team_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tickets_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "api_integrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
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
      exec_sql: {
        Args: {
          sql_query: string
        }
        Returns: undefined
      }
    }
    Enums: {
      channel_type: "email" | "whatsapp" | "sms" | "web" | "telegram"
      ticket_priority: "low" | "medium" | "high" | "urgent"
      ticket_source:
        | "customer_portal"
        | "agent_portal"
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
