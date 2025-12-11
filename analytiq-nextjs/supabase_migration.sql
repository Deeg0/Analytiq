-- Create saved_studies table for storing user's saved study analyses
-- Run this SQL in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS saved_studies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  input_type TEXT NOT NULL CHECK (input_type IN ('url', 'pdf', 'doi', 'text')),
  input_content TEXT NOT NULL,
  analysis_result JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_saved_studies_user_id ON saved_studies(user_id);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_saved_studies_created_at ON saved_studies(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE saved_studies ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only see their own saved studies
CREATE POLICY "Users can view their own saved studies"
  ON saved_studies
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy: Users can insert their own saved studies
CREATE POLICY "Users can insert their own saved studies"
  ON saved_studies
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can update their own saved studies
CREATE POLICY "Users can update their own saved studies"
  ON saved_studies
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create policy: Users can delete their own saved studies
CREATE POLICY "Users can delete their own saved studies"
  ON saved_studies
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_saved_studies_updated_at
  BEFORE UPDATE ON saved_studies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
