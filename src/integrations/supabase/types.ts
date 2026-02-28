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
      calendar_events: {
        Row: {
          all_day: boolean | null
          category:
            | Database["public"]["Enums"]["calendar_event_category"]
            | null
          color: string | null
          created_at: string
          description: string | null
          end_time: string | null
          id: string
          is_recurring: boolean | null
          location: string | null
          project_id: string | null
          recurrence_rule: string | null
          start_time: string
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          all_day?: boolean | null
          category?:
            | Database["public"]["Enums"]["calendar_event_category"]
            | null
          color?: string | null
          created_at?: string
          description?: string | null
          end_time?: string | null
          id?: string
          is_recurring?: boolean | null
          location?: string | null
          project_id?: string | null
          recurrence_rule?: string | null
          start_time: string
          title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          all_day?: boolean | null
          category?:
            | Database["public"]["Enums"]["calendar_event_category"]
            | null
          color?: string | null
          created_at?: string
          description?: string | null
          end_time?: string | null
          id?: string
          is_recurring?: boolean | null
          location?: string | null
          project_id?: string | null
          recurrence_rule?: string | null
          start_time?: string
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      claim_moves: {
        Row: {
          claim_id: string
          claim_type: string
          days_delta: number | null
          id: string
          moved_at: string
          moved_by: string | null
          new_date: string
          old_date: string
          project_id: string
          reason_category: string | null
          reason_text: string | null
        }
        Insert: {
          claim_id: string
          claim_type: string
          days_delta?: number | null
          id?: string
          moved_at?: string
          moved_by?: string | null
          new_date: string
          old_date: string
          project_id: string
          reason_category?: string | null
          reason_text?: string | null
        }
        Update: {
          claim_id?: string
          claim_type?: string
          days_delta?: number | null
          id?: string
          moved_at?: string
          moved_by?: string | null
          new_date?: string
          old_date?: string
          project_id?: string
          reason_category?: string | null
          reason_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "claim_moves_claim_id_fkey"
            columns: ["claim_id"]
            isOneToOne: false
            referencedRelation: "claims"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claim_moves_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      claims: {
        Row: {
          amount: number
          claim_date: string
          claim_type: string
          claimed_date: string | null
          created_at: string
          direction: string
          id: string
          month_key: string
          notes: string | null
          project_id: string
          reference: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount?: number
          claim_date: string
          claim_type: string
          claimed_date?: string | null
          created_at?: string
          direction?: string
          id?: string
          month_key: string
          notes?: string | null
          project_id: string
          reference?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          claim_date?: string
          claim_type?: string
          claimed_date?: string | null
          created_at?: string
          direction?: string
          id?: string
          month_key?: string
          notes?: string | null
          project_id?: string
          reference?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "claims_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      claims_schedule_snapshots: {
        Row: {
          created_at: string
          gp_percent: number
          id: string
          monthly_overhead: number
          notes: string | null
          snapshot_date: string | null
          snapshot_label: string
          snapshot_order: number
        }
        Insert: {
          created_at?: string
          gp_percent?: number
          id?: string
          monthly_overhead?: number
          notes?: string | null
          snapshot_date?: string | null
          snapshot_label: string
          snapshot_order: number
        }
        Update: {
          created_at?: string
          gp_percent?: number
          id?: string
          monthly_overhead?: number
          notes?: string | null
          snapshot_date?: string | null
          snapshot_label?: string
          snapshot_order?: number
        }
        Relationships: []
      }
      claims_snapshot_months: {
        Row: {
          created_at: string
          id: string
          includes_pending: boolean
          month: string
          revenue_ex_gst: number
          revenue_inc_gst: number
          snapshot_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          includes_pending?: boolean
          month: string
          revenue_ex_gst?: number
          revenue_inc_gst?: number
          snapshot_id: string
        }
        Update: {
          created_at?: string
          id?: string
          includes_pending?: boolean
          month?: string
          revenue_ex_gst?: number
          revenue_inc_gst?: number
          snapshot_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "claims_snapshot_months_snapshot_id_fkey"
            columns: ["snapshot_id"]
            isOneToOne: false
            referencedRelation: "claims_schedule_snapshots"
            referencedColumns: ["id"]
          },
        ]
      }
      development_projects: {
        Row: {
          created_at: string
          current_loan: number
          current_value: number
          forecast_margin_on_costs: number
          funds_in_offset: number
          grv: number
          id: string
          is_active: boolean
          project_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_loan?: number
          current_value?: number
          forecast_margin_on_costs?: number
          funds_in_offset?: number
          grv?: number
          id?: string
          is_active?: boolean
          project_name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_loan?: number
          current_value?: number
          forecast_margin_on_costs?: number
          funds_in_offset?: number
          grv?: number
          id?: string
          is_active?: boolean
          project_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      kpi_settings: {
        Row: {
          created_at: string
          gp_percent_target: number
          gp_threshold_green: number
          gp_threshold_orange: number
          id: string
          is_active: boolean
          monthly_revenue_target: number
          overhead_percent: number
          revenue_threshold_green: number
          revenue_threshold_orange: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          gp_percent_target?: number
          gp_threshold_green?: number
          gp_threshold_orange?: number
          id?: string
          is_active?: boolean
          monthly_revenue_target?: number
          overhead_percent?: number
          revenue_threshold_green?: number
          revenue_threshold_orange?: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          gp_percent_target?: number
          gp_threshold_green?: number
          gp_threshold_orange?: number
          id?: string
          is_active?: boolean
          monthly_revenue_target?: number
          overhead_percent?: number
          revenue_threshold_green?: number
          revenue_threshold_orange?: number
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      kpi_settings_audit: {
        Row: {
          change_reason: string | null
          changed_by: string | null
          changed_by_email: string | null
          created_at: string
          gp_percent_target: number
          gp_threshold_green: number
          gp_threshold_orange: number
          id: string
          monthly_revenue_target: number
          overhead_percent: number
          revenue_threshold_green: number
          revenue_threshold_orange: number
          settings_id: string | null
        }
        Insert: {
          change_reason?: string | null
          changed_by?: string | null
          changed_by_email?: string | null
          created_at?: string
          gp_percent_target: number
          gp_threshold_green: number
          gp_threshold_orange: number
          id?: string
          monthly_revenue_target: number
          overhead_percent: number
          revenue_threshold_green: number
          revenue_threshold_orange: number
          settings_id?: string | null
        }
        Update: {
          change_reason?: string | null
          changed_by?: string | null
          changed_by_email?: string | null
          created_at?: string
          gp_percent_target?: number
          gp_threshold_green?: number
          gp_threshold_orange?: number
          id?: string
          monthly_revenue_target?: number
          overhead_percent?: number
          revenue_threshold_green?: number
          revenue_threshold_orange?: number
          settings_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kpi_settings_audit_settings_id_fkey"
            columns: ["settings_id"]
            isOneToOne: false
            referencedRelation: "kpi_settings"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_read: boolean
          read_at: string | null
          recipient_id: string
          sender_id: string
          subject: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_read?: boolean
          read_at?: string | null
          recipient_id: string
          sender_id: string
          subject: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean
          read_at?: string | null
          recipient_id?: string
          sender_id?: string
          subject?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      project_forecast_audit: {
        Row: {
          changed_at: string
          changed_by: string | null
          id: string
          new_contract_value: number
          new_forecast_cost: number
          new_gp_percent: number
          new_gross_profit: number
          old_contract_value: number
          old_forecast_cost: number
          old_gp_percent: number
          old_gross_profit: number
          project_id: string
          reason: string | null
        }
        Insert: {
          changed_at?: string
          changed_by?: string | null
          id?: string
          new_contract_value?: number
          new_forecast_cost?: number
          new_gp_percent?: number
          new_gross_profit?: number
          old_contract_value?: number
          old_forecast_cost?: number
          old_gp_percent?: number
          old_gross_profit?: number
          project_id: string
          reason?: string | null
        }
        Update: {
          changed_at?: string
          changed_by?: string | null
          id?: string
          new_contract_value?: number
          new_forecast_cost?: number
          new_gp_percent?: number
          new_gross_profit?: number
          old_contract_value?: number
          old_forecast_cost?: number
          old_gp_percent?: number
          old_gross_profit?: number
          project_id?: string
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_forecast_audit_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          address: string | null
          category: Database["public"]["Enums"]["project_category"]
          claim_stage_claimed_dates: Json
          claim_stage_statuses: Json
          client_email: string | null
          client_mobile: string | null
          client_name: string | null
          contract_value_ex_gst: number
          contract_value_inc_gst: number
          created_at: string
          created_by: string | null
          current_stage: string | null
          custom_timeframes: Json
          forecast_cost: number
          forecast_gp_percent: number
          forecast_gross_profit: number
          id: string
          job_name: string
          pc_date: string | null
          plans_pdf_path: string | null
          schedule_type: string
          site_manager: string | null
          site_start_date: string | null
          specs_pdf_path: string | null
          start_date: string | null
          status: string
          updated_at: string
          variations: Json
        }
        Insert: {
          address?: string | null
          category?: Database["public"]["Enums"]["project_category"]
          claim_stage_claimed_dates?: Json
          claim_stage_statuses?: Json
          client_email?: string | null
          client_mobile?: string | null
          client_name?: string | null
          contract_value_ex_gst?: number
          contract_value_inc_gst?: number
          created_at?: string
          created_by?: string | null
          current_stage?: string | null
          custom_timeframes?: Json
          forecast_cost?: number
          forecast_gp_percent?: number
          forecast_gross_profit?: number
          id?: string
          job_name: string
          pc_date?: string | null
          plans_pdf_path?: string | null
          schedule_type?: string
          site_manager?: string | null
          site_start_date?: string | null
          specs_pdf_path?: string | null
          start_date?: string | null
          status?: string
          updated_at?: string
          variations?: Json
        }
        Update: {
          address?: string | null
          category?: Database["public"]["Enums"]["project_category"]
          claim_stage_claimed_dates?: Json
          claim_stage_statuses?: Json
          client_email?: string | null
          client_mobile?: string | null
          client_name?: string | null
          contract_value_ex_gst?: number
          contract_value_inc_gst?: number
          created_at?: string
          created_by?: string | null
          current_stage?: string | null
          custom_timeframes?: Json
          forecast_cost?: number
          forecast_gp_percent?: number
          forecast_gross_profit?: number
          id?: string
          job_name?: string
          pc_date?: string | null
          plans_pdf_path?: string | null
          schedule_type?: string
          site_manager?: string | null
          site_start_date?: string | null
          specs_pdf_path?: string | null
          start_date?: string | null
          status?: string
          updated_at?: string
          variations?: Json
        }
        Relationships: []
      }
      sales_leads: {
        Row: {
          client_name: string
          created_at: string
          created_by: string | null
          estimated_value: number
          id: string
          notes: string | null
          revenue_type: string
          status: string
          target_start_date: string | null
          updated_at: string
        }
        Insert: {
          client_name: string
          created_at?: string
          created_by?: string | null
          estimated_value?: number
          id?: string
          notes?: string | null
          revenue_type?: string
          status?: string
          target_start_date?: string | null
          updated_at?: string
        }
        Update: {
          client_name?: string
          created_at?: string
          created_by?: string | null
          estimated_value?: number
          id?: string
          notes?: string | null
          revenue_type?: string
          status?: string
          target_start_date?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      source_form_fields: {
        Row: {
          created_at: string
          field_key: string
          field_type: string
          form_id: string
          id: string
          label: string
          options: Json | null
          required: boolean
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          field_key: string
          field_type?: string
          form_id: string
          id?: string
          label: string
          options?: Json | null
          required?: boolean
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          field_key?: string
          field_type?: string
          form_id?: string
          id?: string
          label?: string
          options?: Json | null
          required?: boolean
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "source_form_fields_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "source_forms"
            referencedColumns: ["id"]
          },
        ]
      }
      source_form_response_values: {
        Row: {
          field_id: string
          id: string
          response_id: string
          value: string | null
        }
        Insert: {
          field_id: string
          id?: string
          response_id: string
          value?: string | null
        }
        Update: {
          field_id?: string
          id?: string
          response_id?: string
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "source_form_response_values_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "source_form_fields"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "source_form_response_values_response_id_fkey"
            columns: ["response_id"]
            isOneToOne: false
            referencedRelation: "source_form_responses"
            referencedColumns: ["id"]
          },
        ]
      }
      source_form_responses: {
        Row: {
          form_id: string
          id: string
          submitted_at: string
          submitted_by_staff_id: string | null
          submitted_by_user_id: string | null
        }
        Insert: {
          form_id: string
          id?: string
          submitted_at?: string
          submitted_by_staff_id?: string | null
          submitted_by_user_id?: string | null
        }
        Update: {
          form_id?: string
          id?: string
          submitted_at?: string
          submitted_by_staff_id?: string | null
          submitted_by_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "source_form_responses_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "source_forms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "source_form_responses_submitted_by_staff_id_fkey"
            columns: ["submitted_by_staff_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      source_forms: {
        Row: {
          assigned_staff_member_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          assigned_staff_member_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          assigned_staff_member_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "source_forms_assigned_staff_member_id_fkey"
            columns: ["assigned_staff_member_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          created_at: string
          created_by: string | null
          department: Database["public"]["Enums"]["team_department"]
          email: string
          id: string
          is_active: boolean | null
          job_title: string | null
          name: string
          phone: string | null
          reports_to: string | null
          role_level: Database["public"]["Enums"]["role_level"]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          department: Database["public"]["Enums"]["team_department"]
          email: string
          id?: string
          is_active?: boolean | null
          job_title?: string | null
          name: string
          phone?: string | null
          reports_to?: string | null
          role_level?: Database["public"]["Enums"]["role_level"]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          department?: Database["public"]["Enums"]["team_department"]
          email?: string
          id?: string
          is_active?: boolean | null
          job_title?: string | null
          name?: string
          phone?: string | null
          reports_to?: string | null
          role_level?: Database["public"]["Enums"]["role_level"]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_members_reports_to_fkey"
            columns: ["reports_to"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
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
          role?: Database["public"]["Enums"]["app_role"]
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
      weather_eot_logs: {
        Row: {
          created_at: string
          id: string
          log_date: string
          project_id: string | null
          rain_amount: number
          rain_chance: number
          severity: string
        }
        Insert: {
          created_at?: string
          id?: string
          log_date: string
          project_id?: string | null
          rain_amount?: number
          rain_chance?: number
          severity?: string
        }
        Update: {
          created_at?: string
          id?: string
          log_date?: string
          project_id?: string | null
          rain_amount?: number
          rain_chance?: number
          severity?: string
        }
        Relationships: [
          {
            foreignKeyName: "weather_eot_logs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
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
      calendar_event_category:
        | "meeting"
        | "deadline"
        | "milestone"
        | "reminder"
        | "task"
        | "other"
      project_category: "pre_construction" | "construction" | "handover"
      role_level: "director" | "manager" | "staff"
      team_department:
        | "site_supervisor"
        | "management"
        | "administration"
        | "accounts"
        | "sales"
        | "estimating"
        | "design_studio"
        | "selections"
        | "finance_admin"
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
      calendar_event_category: [
        "meeting",
        "deadline",
        "milestone",
        "reminder",
        "task",
        "other",
      ],
      project_category: ["pre_construction", "construction", "handover"],
      role_level: ["director", "manager", "staff"],
      team_department: [
        "site_supervisor",
        "management",
        "administration",
        "accounts",
        "sales",
        "estimating",
        "design_studio",
        "selections",
        "finance_admin",
      ],
    },
  },
} as const
