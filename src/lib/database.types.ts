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
      travel_plans: {
        Row: {
          id: string
          created_at: string
          user_id: string
          origin: string
          destination: string
          start_date: string
          end_date: string
          budget: number
          interests: string[]
          transport_mode: string[]
          trip_type: 'one-way' | 'return'
          plan: Json
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          origin: string
          destination: string
          start_date: string
          end_date: string
          budget: number
          interests: string[]
          transport_mode: string[]
          trip_type: 'one-way' | 'return'
          plan: Json
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          origin?: string
          destination?: string
          start_date?: string
          end_date?: string
          budget?: number
          interests?: string[]
          transport_mode?: string[]
          trip_type?: 'one-way' | 'return'
          plan?: Json
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
  }
}