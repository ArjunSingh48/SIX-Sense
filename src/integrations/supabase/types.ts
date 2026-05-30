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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      audit_log: {
        Row: {
          action: string
          actor_id: string | null
          actor_name: string
          created_at: string
          diff: Json
          entity_id: string | null
          entity_type: string
          id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          actor_name?: string
          created_at?: string
          diff?: Json
          entity_id?: string | null
          entity_type: string
          id?: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          actor_name?: string
          created_at?: string
          diff?: Json
          entity_id?: string | null
          entity_type?: string
          id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          author_color: string
          author_name: string
          body: string
          channel_id: string
          confidence: number | null
          created_at: string
          id: string
          kind: string
          sources: string[] | null
          thread_id: string | null
        }
        Insert: {
          author_color?: string
          author_name?: string
          body: string
          channel_id: string
          confidence?: number | null
          created_at?: string
          id?: string
          kind?: string
          sources?: string[] | null
          thread_id?: string | null
        }
        Update: {
          author_color?: string
          author_name?: string
          body?: string
          channel_id?: string
          confidence?: number | null
          created_at?: string
          id?: string
          kind?: string
          sources?: string[] | null
          thread_id?: string | null
        }
        Relationships: []
      }
      documents: {
        Row: {
          access_level: Database["public"]["Enums"]["access_level"]
          content: string | null
          created_at: string
          department: string
          embedding: string | null
          file_path: string | null
          id: string
          mime: string | null
          original_name: string
          owner_id: string | null
          status: Database["public"]["Enums"]["doc_status"]
          summary: string | null
        }
        Insert: {
          access_level?: Database["public"]["Enums"]["access_level"]
          content?: string | null
          created_at?: string
          department?: string
          embedding?: string | null
          file_path?: string | null
          id?: string
          mime?: string | null
          original_name: string
          owner_id?: string | null
          status?: Database["public"]["Enums"]["doc_status"]
          summary?: string | null
        }
        Update: {
          access_level?: Database["public"]["Enums"]["access_level"]
          content?: string | null
          created_at?: string
          department?: string
          embedding?: string | null
          file_path?: string | null
          id?: string
          mime?: string | null
          original_name?: string
          owner_id?: string | null
          status?: Database["public"]["Enums"]["doc_status"]
          summary?: string | null
        }
        Relationships: []
      }
      employee_activity: {
        Row: {
          department: string
          employee_id: string | null
          employee_name: string
          id: string
          kind: Database["public"]["Enums"]["activity_kind"]
          occurred_at: string
          payload: Json
          title: string
        }
        Insert: {
          department?: string
          employee_id?: string | null
          employee_name?: string
          id?: string
          kind: Database["public"]["Enums"]["activity_kind"]
          occurred_at?: string
          payload?: Json
          title: string
        }
        Update: {
          department?: string
          employee_id?: string | null
          employee_name?: string
          id?: string
          kind?: Database["public"]["Enums"]["activity_kind"]
          occurred_at?: string
          payload?: Json
          title?: string
        }
        Relationships: []
      }
      escalations: {
        Row: {
          created_at: string
          id: string
          question_id: string | null
          resolved_at: string | null
          sme_department: string
          sme_id: string | null
          sme_name: string
          sme_role: string
          status: Database["public"]["Enums"]["escalation_status"]
        }
        Insert: {
          created_at?: string
          id?: string
          question_id?: string | null
          resolved_at?: string | null
          sme_department?: string
          sme_id?: string | null
          sme_name?: string
          sme_role?: string
          status?: Database["public"]["Enums"]["escalation_status"]
        }
        Update: {
          created_at?: string
          id?: string
          question_id?: string | null
          resolved_at?: string | null
          sme_department?: string
          sme_id?: string | null
          sme_name?: string
          sme_role?: string
          status?: Database["public"]["Enums"]["escalation_status"]
        }
        Relationships: [
          {
            foreignKeyName: "escalations_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_card_facets: {
        Row: {
          card_id: string
          id: string
          kind: Database["public"]["Enums"]["facet_kind"]
          value: string
        }
        Insert: {
          card_id: string
          id?: string
          kind: Database["public"]["Enums"]["facet_kind"]
          value: string
        }
        Update: {
          card_id?: string
          id?: string
          kind?: Database["public"]["Enums"]["facet_kind"]
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_card_facets_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "knowledge_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_card_sources: {
        Row: {
          card_id: string
          document_id: string | null
          id: string
          page: number | null
          snippet: string
        }
        Insert: {
          card_id: string
          document_id?: string | null
          id?: string
          page?: number | null
          snippet?: string
        }
        Update: {
          card_id?: string
          document_id?: string | null
          id?: string
          page?: number | null
          snippet?: string
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_card_sources_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "knowledge_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "knowledge_card_sources_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_cards: {
        Row: {
          access_level: Database["public"]["Enums"]["access_level"]
          confidence: number
          created_at: string
          department: string
          embedding: string | null
          id: string
          last_reviewed_at: string | null
          owner_id: string | null
          reasoning: string
          summary: string
          title: string
          validation_status: Database["public"]["Enums"]["validation_status"]
        }
        Insert: {
          access_level?: Database["public"]["Enums"]["access_level"]
          confidence?: number
          created_at?: string
          department?: string
          embedding?: string | null
          id?: string
          last_reviewed_at?: string | null
          owner_id?: string | null
          reasoning?: string
          summary?: string
          title: string
          validation_status?: Database["public"]["Enums"]["validation_status"]
        }
        Update: {
          access_level?: Database["public"]["Enums"]["access_level"]
          confidence?: number
          created_at?: string
          department?: string
          embedding?: string | null
          id?: string
          last_reviewed_at?: string | null
          owner_id?: string | null
          reasoning?: string
          summary?: string
          title?: string
          validation_status?: Database["public"]["Enums"]["validation_status"]
        }
        Relationships: []
      }
      knowledge_relations: {
        Row: {
          card_id: string
          id: string
          related_card_id: string
          relation_type: string
        }
        Insert: {
          card_id: string
          id?: string
          related_card_id: string
          relation_type?: string
        }
        Update: {
          card_id?: string
          id?: string
          related_card_id?: string
          relation_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_relations_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "knowledge_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "knowledge_relations_related_card_id_fkey"
            columns: ["related_card_id"]
            isOneToOne: false
            referencedRelation: "knowledge_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_packs: {
        Row: {
          content: Json
          department: string
          generated_at: string
          id: string
          target_role: string
        }
        Insert: {
          content?: Json
          department: string
          generated_at?: string
          id?: string
          target_role: string
        }
        Update: {
          content?: Json
          department?: string
          generated_at?: string
          id?: string
          target_role?: string
        }
        Relationships: []
      }
      performance_reports: {
        Row: {
          author_name: string | null
          content: Json
          created_at: string
          id: string
          kind: string
          recipients: string[] | null
          summary: string | null
          title: string
        }
        Insert: {
          author_name?: string | null
          content?: Json
          created_at?: string
          id?: string
          kind: string
          recipients?: string[] | null
          summary?: string | null
          title: string
        }
        Update: {
          author_name?: string | null
          content?: Json
          created_at?: string
          id?: string
          kind?: string
          recipients?: string[] | null
          summary?: string | null
          title?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          department: string
          full_name: string
          id: string
          job_title: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          department?: string
          full_name?: string
          id: string
          job_title?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          department?: string
          full_name?: string
          id?: string
          job_title?: string
        }
        Relationships: []
      }
      project_tasks: {
        Row: {
          assignee_name: string | null
          created_at: string
          description: string | null
          due_at: string | null
          external_key: string | null
          id: string
          priority: string | null
          progress: number
          project: string | null
          source: string
          status: string
          title: string
          updated_at: string
          url: string | null
        }
        Insert: {
          assignee_name?: string | null
          created_at?: string
          description?: string | null
          due_at?: string | null
          external_key?: string | null
          id?: string
          priority?: string | null
          progress?: number
          project?: string | null
          source?: string
          status?: string
          title: string
          updated_at?: string
          url?: string | null
        }
        Update: {
          assignee_name?: string | null
          created_at?: string
          description?: string | null
          due_at?: string | null
          external_key?: string | null
          id?: string
          priority?: string | null
          progress?: number
          project?: string | null
          source?: string
          status?: string
          title?: string
          updated_at?: string
          url?: string | null
        }
        Relationships: []
      }
      question_sources: {
        Row: {
          card_id: string | null
          id: string
          question_id: string
          weight: number
        }
        Insert: {
          card_id?: string | null
          id?: string
          question_id: string
          weight?: number
        }
        Update: {
          card_id?: string | null
          id?: string
          question_id?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "question_sources_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "knowledge_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_sources_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          answer: string
          asker_id: string | null
          body: string
          confidence: number
          created_at: string
          id: string
          missing_info: string
          reasoning: string
          status: Database["public"]["Enums"]["question_status"]
        }
        Insert: {
          answer?: string
          asker_id?: string | null
          body: string
          confidence?: number
          created_at?: string
          id?: string
          missing_info?: string
          reasoning?: string
          status?: Database["public"]["Enums"]["question_status"]
        }
        Update: {
          answer?: string
          asker_id?: string | null
          body?: string
          confidence?: number
          created_at?: string
          id?: string
          missing_info?: string
          reasoning?: string
          status?: Database["public"]["Enums"]["question_status"]
        }
        Relationships: []
      }
      risk_signals: {
        Row: {
          created_at: string
          department: string
          detail: Json
          employee_id: string | null
          employee_name: string
          id: string
          severity: number
          signal: Database["public"]["Enums"]["risk_signal_kind"]
        }
        Insert: {
          created_at?: string
          department?: string
          detail?: Json
          employee_id?: string | null
          employee_name?: string
          id?: string
          severity?: number
          signal: Database["public"]["Enums"]["risk_signal_kind"]
        }
        Update: {
          created_at?: string
          department?: string
          detail?: Json
          employee_id?: string | null
          employee_name?: string
          id?: string
          severity?: number
          signal?: Database["public"]["Enums"]["risk_signal_kind"]
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
      match_documents: {
        Args: { match_count?: number; query_embedding: string }
        Returns: {
          content: string
          id: string
          original_name: string
          similarity: number
          summary: string
        }[]
      }
      same_department: {
        Args: { _dept: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      access_level: "public" | "department" | "restricted" | "executive"
      activity_kind: "ticket" | "meeting" | "doc" | "decision"
      app_role: "employee" | "manager" | "compliance_officer" | "sme" | "admin"
      doc_status: "processing" | "ready" | "failed"
      escalation_status: "open" | "acknowledged" | "resolved"
      facet_kind:
        | "topic"
        | "decision"
        | "risk"
        | "action"
        | "stakeholder"
        | "business_context"
      question_status: "answered" | "clarify" | "escalated" | "insufficient"
      risk_signal_kind: "leaving" | "spof" | "concentration" | "missing_docs"
      validation_status: "draft" | "validated" | "needs_review" | "archived"
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
      access_level: ["public", "department", "restricted", "executive"],
      activity_kind: ["ticket", "meeting", "doc", "decision"],
      app_role: ["employee", "manager", "compliance_officer", "sme", "admin"],
      doc_status: ["processing", "ready", "failed"],
      escalation_status: ["open", "acknowledged", "resolved"],
      facet_kind: [
        "topic",
        "decision",
        "risk",
        "action",
        "stakeholder",
        "business_context",
      ],
      question_status: ["answered", "clarify", "escalated", "insufficient"],
      risk_signal_kind: ["leaving", "spof", "concentration", "missing_docs"],
      validation_status: ["draft", "validated", "needs_review", "archived"],
    },
  },
} as const
