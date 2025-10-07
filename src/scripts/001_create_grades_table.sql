-- Create grades table
CREATE TABLE IF NOT EXISTS grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  assignment TEXT NOT NULL,
  grade NUMERIC NOT NULL,
  max_grade NUMERIC NOT NULL,
  weight NUMERIC DEFAULT 1,
  category TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "users_view_own_grades" ON grades 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "users_insert_own_grades" ON grades 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_update_own_grades" ON grades 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "users_delete_own_grades" ON grades 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS grades_user_id_idx ON grades(user_id);
CREATE INDEX IF NOT EXISTS grades_date_idx ON grades(date DESC);
