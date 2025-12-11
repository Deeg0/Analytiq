-- Create saved_analyses table
CREATE TABLE IF NOT EXISTS saved_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  analysis_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_saved_analyses_user_id ON saved_analyses(user_id);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_saved_analyses_created_at ON saved_analyses(created_at DESC);

-- Enable Row Level Security
ALTER TABLE saved_analyses ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only see their own saved analyses
CREATE POLICY "Users can view their own saved analyses"
  ON saved_analyses
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy: Users can insert their own saved analyses
CREATE POLICY "Users can insert their own saved analyses"
  ON saved_analyses
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can update their own saved analyses
CREATE POLICY "Users can update their own saved analyses"
  ON saved_analyses
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create policy: Users can delete their own saved analyses
CREATE POLICY "Users can delete their own saved analyses"
  ON saved_analyses
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_saved_analyses_updated_at
  BEFORE UPDATE ON saved_analyses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
