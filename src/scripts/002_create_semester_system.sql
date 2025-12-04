-- Create semesters table
CREATE TABLE IF NOT EXISTS semesters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create subjects table
CREATE TABLE IF NOT EXISTS subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  semester_id UUID NOT NULL REFERENCES semesters(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Update grades table to include semester and subject references
ALTER TABLE grades ADD COLUMN IF NOT EXISTS semester_id UUID REFERENCES semesters(id) ON DELETE CASCADE;
ALTER TABLE grades ADD COLUMN IF NOT EXISTS subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE;
ALTER TABLE grades ALTER COLUMN assignment DROP NOT NULL;

-- Enable RLS on new tables
ALTER TABLE semesters ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;

-- RLS policies for semesters
CREATE POLICY "users_view_own_semesters" ON semesters 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "users_insert_own_semesters" ON semesters 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_update_own_semesters" ON semesters 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "users_delete_own_semesters" ON semesters 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS policies for subjects
CREATE POLICY "users_view_own_subjects" ON subjects 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "users_insert_own_subjects" ON subjects 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_update_own_subjects" ON subjects 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "users_delete_own_subjects" ON subjects 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS semesters_user_id_idx ON semesters(user_id);
CREATE INDEX IF NOT EXISTS subjects_semester_id_idx ON subjects(semester_id);
CREATE INDEX IF NOT EXISTS subjects_user_id_idx ON subjects(user_id);
CREATE INDEX IF NOT EXISTS grades_semester_id_idx ON grades(semester_id);
CREATE INDEX IF NOT EXISTS grades_subject_id_idx ON grades(subject_id);
