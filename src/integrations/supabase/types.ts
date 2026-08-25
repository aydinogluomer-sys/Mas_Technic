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
      customer_files: {
        Row: {
          created_at: string
          file_name: string
          file_type: string | null
          file_url: string
          id: string
          notes: string | null
          order_id: string | null
          rfq_id: string | null
          user_id: string
          version: number | null
        }
        Insert: {
          created_at?: string
          file_name: string
          file_type?: string | null
          file_url: string
          id?: string
          notes?: string | null
          order_id?: string | null
          rfq_id?: string | null
          user_id: string
          version?: number | null
        }
        Update: {
          created_at?: string
          file_name?: string
          file_type?: string | null
          file_url?: string
          id?: string
          notes?: string | null
          order_id?: string | null
          rfq_id?: string | null
          user_id?: string
          version?: number | null
        }
        Relationships: []
      }
      customers: {
        Row: {
          address: string | null
          balance: number | null
          city: string | null
          company: string | null
          created_at: string
          email: string | null
          iban: string | null
          id: number
          last_order: string | null
          name: string | null
          phone: string | null
          short_name: string | null
          tax_info: string | null
        }
        Insert: {
          address?: string | null
          balance?: number | null
          city?: string | null
          company?: string | null
          created_at?: string
          email?: string | null
          iban?: string | null
          id?: number
          last_order?: string | null
          name?: string | null
          phone?: string | null
          short_name?: string | null
          tax_info?: string | null
        }
        Update: {
          address?: string | null
          balance?: number | null
          city?: string | null
          company?: string | null
          created_at?: string
          email?: string | null
          iban?: string | null
          id?: number
          last_order?: string | null
          name?: string | null
          phone?: string | null
          short_name?: string | null
          tax_info?: string | null
        }
        Relationships: []
      }
      documents: {
        Row: {
          created_at: string
          file_urls: string[] | null
          id: string
          title: string
        }
        Insert: {
          created_at?: string
          file_urls?: string[] | null
          id?: string
          title: string
        }
        Update: {
          created_at?: string
          file_urls?: string[] | null
          id?: string
          title?: string
        }
        Relationships: []
      }
      faq_analytics: {
        Row: {
          category: string | null
          created_at: string
          event_type: string
          id: string
          query: string | null
          question: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          event_type: string
          id?: string
          query?: string | null
          question?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          event_type?: string
          id?: string
          query?: string | null
          question?: string | null
        }
        Relationships: []
      }
      financial_documents: {
        Row: {
          ai_category_suggestion: string | null
          ai_summary: string | null
          amount: number | null
          category: string | null
          created_at: string
          currency: string | null
          doc_date: string | null
          doc_number: string | null
          doc_type: string
          due_date: string | null
          file_urls: string[] | null
          id: string
          notes: string | null
          payment_status: string | null
          source: string | null
          status: string | null
          tags: string[] | null
          title: string | null
          total_amount: number | null
          updated_at: string
          user_id: string | null
          vat_amount: number | null
          vat_rate: number | null
          vendor: string | null
        }
        Insert: {
          ai_category_suggestion?: string | null
          ai_summary?: string | null
          amount?: number | null
          category?: string | null
          created_at?: string
          currency?: string | null
          doc_date?: string | null
          doc_number?: string | null
          doc_type?: string
          due_date?: string | null
          file_urls?: string[] | null
          id?: string
          notes?: string | null
          payment_status?: string | null
          source?: string | null
          status?: string | null
          tags?: string[] | null
          title?: string | null
          total_amount?: number | null
          updated_at?: string
          user_id?: string | null
          vat_amount?: number | null
          vat_rate?: number | null
          vendor?: string | null
        }
        Update: {
          ai_category_suggestion?: string | null
          ai_summary?: string | null
          amount?: number | null
          category?: string | null
          created_at?: string
          currency?: string | null
          doc_date?: string | null
          doc_number?: string | null
          doc_type?: string
          due_date?: string | null
          file_urls?: string[] | null
          id?: string
          notes?: string | null
          payment_status?: string | null
          source?: string | null
          status?: string | null
          tags?: string[] | null
          title?: string | null
          total_amount?: number | null
          updated_at?: string
          user_id?: string | null
          vat_amount?: number | null
          vat_rate?: number | null
          vendor?: string | null
        }
        Relationships: []
      }
      issues: {
        Row: {
          category: string | null
          cost: number | null
          created_at: string
          date: string | null
          detail: string | null
          id: string
          job: string | null
          machine: string | null
          resolution: string | null
          severity: string | null
          status: string | null
        }
        Insert: {
          category?: string | null
          cost?: number | null
          created_at?: string
          date?: string | null
          detail?: string | null
          id: string
          job?: string | null
          machine?: string | null
          resolution?: string | null
          severity?: string | null
          status?: string | null
        }
        Update: {
          category?: string | null
          cost?: number | null
          created_at?: string
          date?: string | null
          detail?: string | null
          id?: string
          job?: string | null
          machine?: string | null
          resolution?: string | null
          severity?: string | null
          status?: string | null
        }
        Relationships: []
      }
      machine_health: {
        Row: {
          created_at: string
          filter_life: number | null
          id: string
          name: string
          next_maintenance: number | null
          oil_level: number | null
          spindle_hours: number | null
          status: string | null
        }
        Insert: {
          created_at?: string
          filter_life?: number | null
          id?: string
          name: string
          next_maintenance?: number | null
          oil_level?: number | null
          spindle_hours?: number | null
          status?: string | null
        }
        Update: {
          created_at?: string
          filter_life?: number | null
          id?: string
          name?: string
          next_maintenance?: number | null
          oil_level?: number | null
          spindle_hours?: number | null
          status?: string | null
        }
        Relationships: []
      }
      machine_schedule: {
        Row: {
          created_at: string | null
          day: string
          hours: number | null
          id: string
          job_name: string | null
          machine: string
          notes: string | null
          order_id: string | null
          week_start: string
        }
        Insert: {
          created_at?: string | null
          day: string
          hours?: number | null
          id?: string
          job_name?: string | null
          machine: string
          notes?: string | null
          order_id?: string | null
          week_start: string
        }
        Update: {
          created_at?: string | null
          day?: string
          hours?: number | null
          id?: string
          job_name?: string | null
          machine?: string
          notes?: string | null
          order_id?: string | null
          week_start?: string
        }
        Relationships: []
      }
      maintenance_logs: {
        Row: {
          cost: number | null
          created_at: string
          date: string
          detail: string | null
          duration: string | null
          id: string
          machine: string
          status: string | null
          technician: string | null
          type: string
        }
        Insert: {
          cost?: number | null
          created_at?: string
          date?: string
          detail?: string | null
          duration?: string | null
          id?: string
          machine: string
          status?: string | null
          technician?: string | null
          type?: string
        }
        Update: {
          cost?: number | null
          created_at?: string
          date?: string
          detail?: string | null
          duration?: string | null
          id?: string
          machine?: string
          status?: string | null
          technician?: string | null
          type?: string
        }
        Relationships: []
      }
      meetings: {
        Row: {
          company: string | null
          created_at: string
          email: string
          id: string
          meeting_date: string
          meeting_time: string
          name: string
          notes: string | null
          phone: string | null
          status: string
          topic: string
          user_id: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string
          email: string
          id?: string
          meeting_date: string
          meeting_time: string
          name: string
          notes?: string | null
          phone?: string | null
          status?: string
          topic: string
          user_id?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string
          id?: string
          meeting_date?: string
          meeting_time?: string
          name?: string
          notes?: string | null
          phone?: string | null
          status?: string
          topic?: string
          user_id?: string | null
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          created_at: string
          email_finance: boolean
          email_order: boolean
          email_quality: boolean
          email_rfq: boolean
          id: string
          push_finance: boolean
          push_order: boolean
          push_quality: boolean
          push_rfq: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email_finance?: boolean
          email_order?: boolean
          email_quality?: boolean
          email_rfq?: boolean
          id?: string
          push_finance?: boolean
          push_order?: boolean
          push_quality?: boolean
          push_rfq?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email_finance?: boolean
          email_order?: boolean
          email_quality?: boolean
          email_rfq?: boolean
          id?: string
          push_finance?: boolean
          push_order?: boolean
          push_quality?: boolean
          push_rfq?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          completed_qty: number
          created_at: string
          customer: string | null
          deadline: string | null
          id: string
          machine: string | null
          notes: string | null
          order_date: string | null
          packed_qty: number
          part_name: string | null
          progress: number | null
          qc_passed_qty: number
          quantity: number | null
          rfq_ref: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          completed_qty?: number
          created_at?: string
          customer?: string | null
          deadline?: string | null
          id: string
          machine?: string | null
          notes?: string | null
          order_date?: string | null
          packed_qty?: number
          part_name?: string | null
          progress?: number | null
          qc_passed_qty?: number
          quantity?: number | null
          rfq_ref?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          completed_qty?: number
          created_at?: string
          customer?: string | null
          deadline?: string | null
          id?: string
          machine?: string | null
          notes?: string | null
          order_date?: string | null
          packed_qty?: number
          part_name?: string | null
          progress?: number | null
          qc_passed_qty?: number
          quantity?: number | null
          rfq_ref?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_rfq_ref_fkey"
            columns: ["rfq_ref"]
            isOneToOne: false
            referencedRelation: "rfqs"
            referencedColumns: ["id"]
          },
        ]
      }
      pipeline_leads: {
        Row: {
          company: string | null
          contact_email: string | null
          contact_name: string | null
          created_at: string | null
          id: string
          last_action: string | null
          notes: string | null
          probability: number | null
          stage: string | null
          updated_at: string | null
          value: number | null
        }
        Insert: {
          company?: string | null
          contact_email?: string | null
          contact_name?: string | null
          created_at?: string | null
          id?: string
          last_action?: string | null
          notes?: string | null
          probability?: number | null
          stage?: string | null
          updated_at?: string | null
          value?: number | null
        }
        Update: {
          company?: string | null
          contact_email?: string | null
          contact_name?: string | null
          created_at?: string | null
          id?: string
          last_action?: string | null
          notes?: string | null
          probability?: number | null
          stage?: string | null
          updated_at?: string | null
          value?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          city: string | null
          company: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          city?: string | null
          company?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          city?: string | null
          company?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      quality_reports: {
        Row: {
          created_at: string
          file_url: string | null
          id: string
          notes: string | null
          order_id: string | null
          report_type: string | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          file_url?: string | null
          id?: string
          notes?: string | null
          order_id?: string | null
          report_type?: string | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          file_url?: string | null
          id?: string
          notes?: string | null
          order_id?: string | null
          report_type?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      raw_materials: {
        Row: {
          code: string
          created_at: string
          id: string
          name: string
          spec: string | null
          stock: number | null
          unit: string | null
          unit_cost: number | null
          waste_rate: number | null
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          name: string
          spec?: string | null
          stock?: number | null
          unit?: string | null
          unit_cost?: number | null
          waste_rate?: number | null
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          name?: string
          spec?: string | null
          stock?: number | null
          unit?: string | null
          unit_cost?: number | null
          waste_rate?: number | null
        }
        Relationships: []
      }
      rfqs: {
        Row: {
          company: string | null
          created_at: string
          customer: string | null
          customer_approved: boolean | null
          customer_approved_at: string | null
          date: string | null
          email: string | null
          files: string[] | null
          id: string
          material: string | null
          notes: string | null
          phone: string | null
          price_valid_until: string | null
          quantity: number | null
          quoted_price: number | null
          rejection_reason: string | null
          service: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string
          customer?: string | null
          customer_approved?: boolean | null
          customer_approved_at?: string | null
          date?: string | null
          email?: string | null
          files?: string[] | null
          id: string
          material?: string | null
          notes?: string | null
          phone?: string | null
          price_valid_until?: string | null
          quantity?: number | null
          quoted_price?: number | null
          rejection_reason?: string | null
          service?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string
          customer?: string | null
          customer_approved?: boolean | null
          customer_approved_at?: string | null
          date?: string | null
          email?: string | null
          files?: string[] | null
          id?: string
          material?: string | null
          notes?: string | null
          phone?: string | null
          price_valid_until?: string | null
          quantity?: number | null
          quoted_price?: number | null
          rejection_reason?: string | null
          service?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      support_messages: {
        Row: {
          created_at: string
          id: string
          is_staff: boolean | null
          message: string
          ticket_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_staff?: boolean | null
          message: string
          ticket_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_staff?: boolean | null
          message?: string
          ticket_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          created_at: string
          id: string
          message: string
          order_id: string | null
          priority: string | null
          status: string | null
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          order_id?: string | null
          priority?: string | null
          status?: string | null
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          order_id?: string | null
          priority?: string | null
          status?: string | null
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tool_inventory: {
        Row: {
          category: string | null
          code: string
          created_at: string
          id: string
          min_stock: number | null
          name: string
          stock: number | null
          supplier: string | null
          unit_cost: number | null
        }
        Insert: {
          category?: string | null
          code: string
          created_at?: string
          id?: string
          min_stock?: number | null
          name: string
          stock?: number | null
          supplier?: string | null
          unit_cost?: number | null
        }
        Update: {
          category?: string | null
          code?: string
          created_at?: string
          id?: string
          min_stock?: number | null
          name?: string
          stock?: number | null
          supplier?: string | null
          unit_cost?: number | null
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
      wbs: {
        Row: {
          created_at: string
          current_step: number | null
          customer: string | null
          deadline: string | null
          id: string
          machine: string | null
          order_id: string | null
          part_name: string | null
          status: string | null
          total_qty: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          current_step?: number | null
          customer?: string | null
          deadline?: string | null
          id: string
          machine?: string | null
          order_id?: string | null
          part_name?: string | null
          status?: string | null
          total_qty?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          current_step?: number | null
          customer?: string | null
          deadline?: string | null
          id?: string
          machine?: string | null
          order_id?: string | null
          part_name?: string | null
          status?: string | null
          total_qty?: number | null
          user_id?: string | null
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
      is_staff: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "staff" | "production" | "quality"
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
      app_role: ["admin", "staff", "production", "quality"],
    },
  },
} as const
