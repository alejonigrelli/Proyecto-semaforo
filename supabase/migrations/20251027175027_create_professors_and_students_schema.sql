/*
  # Create Professors and Students Schema

  ## Overview
  This migration creates the complete database schema for the teacher management application.
  It includes tables for professor profiles and student records with proper relationships and security.

  ## New Tables

  ### 1. professors
  - `id` (uuid, primary key) - References auth.users
  - `first_name` (text) - Professor's first name
  - `last_name` (text) - Professor's last name
  - `profile_photo_url` (text, nullable) - URL to profile photo in Supabase Storage
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Record update timestamp

  ### 2. students
  - `id` (uuid, primary key) - Auto-generated unique identifier
  - `professor_id` (uuid, foreign key) - References professors table
  - `first_name` (text) - Student's first name
  - `last_name` (text) - Student's last name
  - `legajo` (text) - Student identification number (unique per professor)
  - `grade` (integer) - Student grade (0-100)
  - `observations` (text, nullable) - Additional notes about the student
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Record update timestamp

  ## Security

  ### Row Level Security (RLS)
  - All tables have RLS enabled
  - Professors can only access their own profile data
  - Professors can only manage students linked to their account
  - Anonymous users have no access to any data

  ### Policies

  #### professors table
  - `professors_select_own`: Authenticated users can view their own profile
  - `professors_insert_own`: Authenticated users can create their own profile
  - `professors_update_own`: Authenticated users can update their own profile
  - `professors_delete_own`: Authenticated users can delete their own profile

  #### students table
  - `students_select_own`: Professors can view only their own students
  - `students_insert_own`: Professors can create students linked to their account
  - `students_update_own`: Professors can update only their own students
  - `students_delete_own`: Professors can delete only their own students

  ## Important Notes
  - Grade values are constrained between 0 and 100
  - Legajo must be unique per professor (composite unique constraint)
  - Cascading delete: if a professor is deleted, their students are also deleted
  - Updated_at timestamp is automatically maintained via trigger
*/

-- Create professors table
CREATE TABLE IF NOT EXISTS professors (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name text NOT NULL DEFAULT '',
  last_name text NOT NULL DEFAULT '',
  profile_photo_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professor_id uuid NOT NULL REFERENCES professors(id) ON DELETE CASCADE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  legajo text NOT NULL,
  grade integer NOT NULL CHECK (grade >= 0 AND grade <= 100),
  observations text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(professor_id, legajo)
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_students_professor_id ON students(professor_id);
CREATE INDEX IF NOT EXISTS idx_students_legajo ON students(professor_id, legajo);
CREATE INDEX IF NOT EXISTS idx_students_grade ON students(grade);

-- Enable Row Level Security
ALTER TABLE professors ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Professors table policies
CREATE POLICY "professors_select_own"
  ON professors FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "professors_insert_own"
  ON professors FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "professors_update_own"
  ON professors FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "professors_delete_own"
  ON professors FOR DELETE
  TO authenticated
  USING (auth.uid() = id);

-- Students table policies
CREATE POLICY "students_select_own"
  ON students FOR SELECT
  TO authenticated
  USING (professor_id IN (SELECT id FROM professors WHERE id = auth.uid()));

CREATE POLICY "students_insert_own"
  ON students FOR INSERT
  TO authenticated
  WITH CHECK (professor_id IN (SELECT id FROM professors WHERE id = auth.uid()));

CREATE POLICY "students_update_own"
  ON students FOR UPDATE
  TO authenticated
  USING (professor_id IN (SELECT id FROM professors WHERE id = auth.uid()))
  WITH CHECK (professor_id IN (SELECT id FROM professors WHERE id = auth.uid()));

CREATE POLICY "students_delete_own"
  ON students FOR DELETE
  TO authenticated
  USING (professor_id IN (SELECT id FROM professors WHERE id = auth.uid()));

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_professors_updated_at ON professors;
CREATE TRIGGER update_professors_updated_at
  BEFORE UPDATE ON professors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_students_updated_at ON students;
CREATE TRIGGER update_students_updated_at
  BEFORE UPDATE ON students
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create storage bucket for profile photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-photos', 'profile-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for profile photos
CREATE POLICY "professors_upload_own_photo"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'profile-photos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "professors_update_own_photo"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'profile-photos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "professors_delete_own_photo"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'profile-photos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "profile_photos_public_read"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'profile-photos');
