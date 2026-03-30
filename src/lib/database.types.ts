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
      professors: {
        Row: {
          id: string
          first_name: string
          last_name: string
          profile_photo_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          first_name?: string
          last_name?: string
          profile_photo_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          profile_photo_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      students: {
        Row: {
          id: string
          professor_id: string
          first_name: string
          last_name: string
          legajo: string
          grade: number
          observations: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          professor_id: string
          first_name: string
          last_name: string
          legajo: string
          grade: number
          observations?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          professor_id?: string
          first_name?: string
          last_name?: string
          legajo?: string
          grade?: number
          observations?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
