-- =====================================================
-- Migration: user_save_progress
-- One row per user. Stores the aggregated result of
-- the last parsed save file (not per-character detail,
-- that lives in completion_marks).
-- =====================================================

CREATE TABLE IF NOT EXISTS user_save_progress (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Scalar columns for fast filtering/ordering
  save_hash    TEXT,
  dead_god_percent NUMERIC(5, 2) NOT NULL DEFAULT 0,
  slot         SMALLINT    NOT NULL DEFAULT 1,

  -- Structured JSONB sections (easier to query than one giant blob)
  items        JSONB       NOT NULL DEFAULT '{}',
  -- { "collected": 489, "total": 733, "missingIds": [12, 45, ...] }

  achievements JSONB       NOT NULL DEFAULT '{}',
  -- { "unlocked": 425, "total": 637, "missingIds": [] }

  characters   JSONB       NOT NULL DEFAULT '{}',
  -- { "Isaac": { "percentage": 100, "isTainted": false, "completedMarks": 24 }, ... }

  summary      JSONB       NOT NULL DEFAULT '{}',
  -- { "endings": { "seen": 14, "total": 17 },
  --   "trinkets": { "collected": 89, "total": 189 },
  --   "completionMarks": 287, "totalMarks": 816,
  --   "vanillaCompleted": 17, "taintedCompleted": 17,
  --   "hoursRemaining": 23 }

  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_user_progress UNIQUE (user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_save_progress_user_id
  ON user_save_progress(user_id);

CREATE INDEX IF NOT EXISTS idx_user_save_progress_dead_god
  ON user_save_progress(dead_god_percent DESC);

CREATE INDEX IF NOT EXISTS idx_user_save_progress_updated_at
  ON user_save_progress(updated_at DESC);

-- Enable RLS
ALTER TABLE user_save_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own progress"
  ON user_save_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON user_save_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON user_save_progress FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own progress"
  ON user_save_progress FOR DELETE
  USING (auth.uid() = user_id);

-- Auto-update timestamp
CREATE OR REPLACE FUNCTION update_user_save_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_user_save_progress_updated_at
  BEFORE UPDATE ON user_save_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_user_save_progress_updated_at();

COMMENT ON TABLE user_save_progress IS
  'Aggregated save file progress per user. One row per user, updated on each upload.';
COMMENT ON COLUMN user_save_progress.items IS
  '{"collected": N, "total": N, "missingIds": [...]}';
COMMENT ON COLUMN user_save_progress.achievements IS
  '{"unlocked": N, "total": N}';
COMMENT ON COLUMN user_save_progress.characters IS
  '{"Isaac": {"percentage": 100, "isTainted": false, "completedMarks": 24}, ...}';
COMMENT ON COLUMN user_save_progress.summary IS
  'Misc aggregate data: endings, trinkets, marks totals, vanilla/tainted counts';
