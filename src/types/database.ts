// Database types for Supabase
// Auto-generated types based on database schema

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          first_name: string
          last_name: string
          phone: string
          company: string
          role: 'gestionnaire' | 'artisan' | 'admin'
          is_verified: boolean
          is_certified: boolean | null
          created_at: string
          arrondissements: number[] | null
          trades: string[] | null
          rating: number | null
          completed_projects: number | null
          avatar: string | null
          bank_details_iban: string | null
          bank_details_bic: string | null
          bank_details_account_holder: string | null
        }
        Insert: {
          id: string
          email: string
          first_name: string
          last_name: string
          phone: string
          company: string
          role: 'gestionnaire' | 'artisan' | 'admin'
          is_verified?: boolean
          is_certified?: boolean | null
          created_at?: string
          arrondissements?: number[] | null
          trades?: string[] | null
          rating?: number | null
          completed_projects?: number | null
          avatar?: string | null
          bank_details_iban?: string | null
          bank_details_bic?: string | null
          bank_details_account_holder?: string | null
        }
        Update: {
          id?: string
          email?: string
          first_name?: string
          last_name?: string
          phone?: string
          company?: string
          role?: 'gestionnaire' | 'artisan' | 'admin'
          is_verified?: boolean
          is_certified?: boolean | null
          created_at?: string
          arrondissements?: number[] | null
          trades?: string[] | null
          rating?: number | null
          completed_projects?: number | null
          avatar?: string | null
          bank_details_iban?: string | null
          bank_details_bic?: string | null
          bank_details_account_holder?: string | null
        }
      }
      emergencies: {
        Row: {
          id: string
          title: string
          description: string
          address: string
          arrondissement: number
          trade: string
          max_budget: number
          status: 'open' | 'in_progress' | 'completed' | 'closed'
          created_by: string
          created_at: string
          photos: string[] | null
          urgency_level: 'low' | 'medium' | 'high' | 'critical'
          accepted_proposal_id: string | null
        }
        Insert: {
          id?: string
          title: string
          description: string
          address: string
          arrondissement: number
          trade: string
          max_budget: number
          status?: 'open' | 'in_progress' | 'completed' | 'closed'
          created_by: string
          created_at?: string
          photos?: string[] | null
          urgency_level: 'low' | 'medium' | 'high' | 'critical'
          accepted_proposal_id?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string
          address?: string
          arrondissement?: number
          trade?: string
          max_budget?: number
          status?: 'open' | 'in_progress' | 'completed' | 'closed'
          created_by?: string
          created_at?: string
          photos?: string[] | null
          urgency_level?: 'low' | 'medium' | 'high' | 'critical'
          accepted_proposal_id?: string | null
        }
      }
      proposals: {
        Row: {
          id: string
          emergency_id: string
          artisan_id: string
          artisan_name: string
          artisan_company: string
          artisan_rating: number | null
          price: number
          description: string
          estimated_duration: string
          status: 'pending' | 'accepted' | 'rejected'
          created_at: string
        }
        Insert: {
          id?: string
          emergency_id: string
          artisan_id: string
          artisan_name: string
          artisan_company: string
          artisan_rating?: number | null
          price: number
          description: string
          estimated_duration: string
          status?: 'pending' | 'accepted' | 'rejected'
          created_at?: string
        }
        Update: {
          id?: string
          emergency_id?: string
          artisan_id?: string
          artisan_name?: string
          artisan_company?: string
          artisan_rating?: number | null
          price?: number
          description?: string
          estimated_duration?: string
          status?: 'pending' | 'accepted' | 'rejected'
          created_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          emergency_id: string
          proposal_id: string
          gestionnaire_id: string
          artisan_id: string
          title: string
          description: string
          address: string
          price: number
          status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'paid'
          start_date: string | null
          completed_date: string | null
          photos_before: string[] | null
          photos_during: string[] | null
          photos_after: string[] | null
          rating: number | null
          review: string | null
        }
        Insert: {
          id?: string
          emergency_id: string
          proposal_id: string
          gestionnaire_id: string
          artisan_id: string
          title: string
          description: string
          address: string
          price: number
          status?: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'paid'
          start_date?: string | null
          completed_date?: string | null
          photos_before?: string[] | null
          photos_during?: string[] | null
          photos_after?: string[] | null
          rating?: number | null
          review?: string | null
        }
        Update: {
          id?: string
          emergency_id?: string
          proposal_id?: string
          gestionnaire_id?: string
          artisan_id?: string
          title?: string
          description?: string
          address?: string
          price?: number
          status?: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'paid'
          start_date?: string | null
          completed_date?: string | null
          photos_before?: string[] | null
          photos_during?: string[] | null
          photos_after?: string[] | null
          rating?: number | null
          review?: string | null
        }
      }
      chat_messages: {
        Row: {
          id: string
          project_id: string
          sender_id: string
          sender_name: string
          message: string
          timestamp: string
          photos: string[] | null
          is_read: boolean
        }
        Insert: {
          id?: string
          project_id: string
          sender_id: string
          sender_name: string
          message: string
          timestamp?: string
          photos?: string[] | null
          is_read?: boolean
        }
        Update: {
          id?: string
          project_id?: string
          sender_id?: string
          sender_name?: string
          message?: string
          timestamp?: string
          photos?: string[] | null
          is_read?: boolean
        }
      }
      project_timeline_entries: {
        Row: {
          id: string
          project_id: string
          type: 'status_change' | 'message' | 'photo_upload' | 'payment'
          message: string
          author: string
          timestamp: string
          photos: string[] | null
        }
        Insert: {
          id?: string
          project_id: string
          type: 'status_change' | 'message' | 'photo_upload' | 'payment'
          message: string
          author: string
          timestamp?: string
          photos?: string[] | null
        }
        Update: {
          id?: string
          project_id?: string
          type?: 'status_change' | 'message' | 'photo_upload' | 'payment'
          message?: string
          author?: string
          timestamp?: string
          photos?: string[] | null
        }
      }
      payments: {
        Row: {
          id: string
          project_id: string
          artisan_id: string
          gestionnaire_id: string
          amount: number
          status: 'pending' | 'processing' | 'completed' | 'failed'
          invoice_url: string | null
          created_at: string
          processed_at: string | null
          description: string
        }
        Insert: {
          id?: string
          project_id: string
          artisan_id: string
          gestionnaire_id: string
          amount: number
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          invoice_url?: string | null
          created_at?: string
          processed_at?: string | null
          description: string
        }
        Update: {
          id?: string
          project_id?: string
          artisan_id?: string
          gestionnaire_id?: string
          amount?: number
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          invoice_url?: string | null
          created_at?: string
          processed_at?: string | null
          description?: string
        }
      }
      invoices: {
        Row: {
          id: string
          project_id: string
          payment_id: string
          invoice_number: string
          amount: number
          tax_amount: number
          total_amount: number
          issue_date: string
          due_date: string
          status: 'draft' | 'sent' | 'paid' | 'overdue'
          pdf_url: string | null
        }
        Insert: {
          id?: string
          project_id: string
          payment_id: string
          invoice_number: string
          amount: number
          tax_amount: number
          total_amount: number
          issue_date?: string
          due_date: string
          status?: 'draft' | 'sent' | 'paid' | 'overdue'
          pdf_url?: string | null
        }
        Update: {
          id?: string
          project_id?: string
          payment_id?: string
          invoice_number?: string
          amount?: number
          tax_amount?: number
          total_amount?: number
          issue_date?: string
          due_date?: string
          status?: 'draft' | 'sent' | 'paid' | 'overdue'
          pdf_url?: string | null
        }
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