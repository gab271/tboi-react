-- =====================================================
-- Migration: Create completion_marks table
-- Stores character completion marks per user
-- =====================================================

-- Create completion_marks table
CREATE TABLE IF NOT EXISTS completion_marks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  character_id TEXT NOT NULL,
  marks_data JSONB NOT NULL DEFAULT '{}',
  source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'save', 'merged')),
  save_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint per user/character
  CONSTRAINT unique_user_character UNIQUE (user_id, character_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_completion_marks_user_id 
  ON completion_marks(user_id);

CREATE INDEX IF NOT EXISTS idx_completion_marks_character_id 
  ON completion_marks(character_id);

CREATE INDEX IF NOT EXISTS idx_completion_marks_updated_at 
  ON completion_marks(updated_at DESC);

-- Enable Row Level Security
ALTER TABLE completion_marks ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own marks
CREATE POLICY "Users can view own marks" 
  ON completion_marks 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own marks" 
  ON completion_marks 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own marks" 
  ON completion_marks 
  FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own marks" 
  ON completion_marks 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_completion_marks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_completion_marks_updated_at
  BEFORE UPDATE ON completion_marks
  FOR EACH ROW
  EXECUTE FUNCTION update_completion_marks_updated_at();

-- Comments
COMMENT ON TABLE completion_marks IS 'Stores character completion marks for each user';
COMMENT ON COLUMN completion_marks.character_id IS 'ID del personaje (ej: "isaac", "tainted_isaac")';
COMMENT ON COLUMN completion_marks.marks_data IS 'JSON con el estado de cada mark (heart, isaac, etc)';
COMMENT ON COLUMN completion_marks.source IS 'Origen de los datos: manual, save, merged';
COMMENT ON COLUMN completion_marks.save_hash IS 'Hash del save file para detectar cambios';
