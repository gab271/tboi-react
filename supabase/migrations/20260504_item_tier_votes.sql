-- =====================================================
-- Migration: Item Tier List voting system
-- Stores community votes and aggregated tier scores
-- =====================================================

-- Enum for tier ranks
CREATE TYPE tier_rank AS ENUM ('S', 'A', 'B', 'C', 'D', 'F');

-- ─── Votes table ──────────────────────────────────────────────────────────────
-- Source of truth: one vote per user per item per context (character + run_type)
-- character_id = 'ALL' means "any character" (global context)
-- run_type     = 'normal' | 'greed' | 'greedier' | 'challenge'

CREATE TABLE item_tier_votes (
    id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id      UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    item_id      UUID        NOT NULL REFERENCES codex_items(id) ON DELETE CASCADE,
    tier         tier_rank   NOT NULL,
    character_id TEXT        NOT NULL DEFAULT 'ALL',
    run_type     TEXT        NOT NULL DEFAULT 'normal'
                             CHECK (run_type IN ('normal', 'greed', 'greedier', 'challenge')),
    created_at   TIMESTAMPTZ DEFAULT NOW(),
    updated_at   TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE (user_id, item_id, character_id, run_type)
);

CREATE INDEX idx_tier_votes_item_ctx ON item_tier_votes (item_id, character_id, run_type);
CREATE INDEX idx_tier_votes_user     ON item_tier_votes (user_id);

-- ─── Scores table ─────────────────────────────────────────────────────────────
-- Read-optimised cache. Auto-updated via trigger on item_tier_votes.
-- avg_score: S=6, A=5, B=4, C=3, D=2, F=1

CREATE TABLE item_tier_scores (
    item_id       UUID        NOT NULL REFERENCES codex_items(id) ON DELETE CASCADE,
    character_id  TEXT        NOT NULL DEFAULT 'ALL',
    run_type      TEXT        NOT NULL DEFAULT 'normal',
    avg_score     FLOAT       NOT NULL DEFAULT 0,
    computed_tier tier_rank   NOT NULL DEFAULT 'C',
    vote_count    INT         NOT NULL DEFAULT 0,
    updated_at    TIMESTAMPTZ DEFAULT NOW(),

    PRIMARY KEY (item_id, character_id, run_type)
);

CREATE INDEX idx_tier_scores_item ON item_tier_scores (item_id);

-- ─── Auto-recalculation trigger ───────────────────────────────────────────────
-- Fires on INSERT, UPDATE, DELETE of a vote.
-- Recalculates only the affected item+context row in item_tier_scores.

CREATE OR REPLACE FUNCTION recalculate_tier_score()
RETURNS TRIGGER AS $$
DECLARE
    v_item_id     TEXT;
    v_char_id     TEXT;
    v_run_type    TEXT;
    v_avg         FLOAT;
    v_count       INT;
    v_tier        tier_rank;
BEGIN
    -- Resolve which row changed (handle DELETE where NEW is null)
    v_item_id  := COALESCE(NEW.item_id,      OLD.item_id);
    v_char_id  := COALESCE(NEW.character_id, OLD.character_id);
    v_run_type := COALESCE(NEW.run_type,     OLD.run_type);

    SELECT
        AVG(CASE tier
            WHEN 'S' THEN 6 WHEN 'A' THEN 5 WHEN 'B' THEN 4
            WHEN 'C' THEN 3 WHEN 'D' THEN 2 WHEN 'F' THEN 1
        END),
        COUNT(*)
    INTO v_avg, v_count
    FROM item_tier_votes
    WHERE item_id      = v_item_id
      AND character_id = v_char_id
      AND run_type     = v_run_type;

    IF v_count = 0 THEN
        -- No votes left: remove cached score row
        DELETE FROM item_tier_scores
        WHERE item_id = v_item_id AND character_id = v_char_id AND run_type = v_run_type;
        RETURN OLD;
    END IF;

    v_tier := CASE
        WHEN v_avg >= 5.5 THEN 'S'::tier_rank
        WHEN v_avg >= 4.5 THEN 'A'::tier_rank
        WHEN v_avg >= 3.5 THEN 'B'::tier_rank
        WHEN v_avg >= 2.5 THEN 'C'::tier_rank
        WHEN v_avg >= 1.5 THEN 'D'::tier_rank
        ELSE 'F'::tier_rank
    END;

    INSERT INTO item_tier_scores (item_id, character_id, run_type, avg_score, computed_tier, vote_count, updated_at)
    VALUES (v_item_id, v_char_id, v_run_type, v_avg, v_tier, v_count, NOW())
    ON CONFLICT (item_id, character_id, run_type) DO UPDATE SET
        avg_score     = EXCLUDED.avg_score,
        computed_tier = EXCLUDED.computed_tier,
        vote_count    = EXCLUDED.vote_count,
        updated_at    = NOW();

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_recalculate_tier_score
    AFTER INSERT OR UPDATE OR DELETE ON item_tier_votes
    FOR EACH ROW EXECUTE FUNCTION recalculate_tier_score();

-- ─── updated_at trigger for votes ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_tier_votes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_tier_votes_updated_at
    BEFORE UPDATE ON item_tier_votes
    FOR EACH ROW EXECUTE FUNCTION update_tier_votes_updated_at();

-- ─── Row Level Security ───────────────────────────────────────────────────────

ALTER TABLE item_tier_votes  ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_tier_scores ENABLE ROW LEVEL SECURITY;

-- Votes: users manage only their own rows; anyone can read aggregated scores
CREATE POLICY "Users can view all votes"
    ON item_tier_votes FOR SELECT USING (true);

CREATE POLICY "Users can insert own votes"
    ON item_tier_votes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own votes"
    ON item_tier_votes FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own votes"
    ON item_tier_votes FOR DELETE
    USING (auth.uid() = user_id);

-- Scores: public read, backend service role handles writes via trigger
CREATE POLICY "Anyone can view tier scores"
    ON item_tier_scores FOR SELECT USING (true);

-- ─── Comments ─────────────────────────────────────────────────────────────────

COMMENT ON TABLE  item_tier_votes              IS 'Community votes: one per user per item per context';
COMMENT ON TABLE  item_tier_scores             IS 'Cached aggregate tier scores, auto-updated by trigger';
COMMENT ON COLUMN item_tier_votes.character_id IS 'Character slug (e.g. "the_lost") or "ALL" for global';
COMMENT ON COLUMN item_tier_votes.run_type     IS 'Run mode: normal | greed | greedier | challenge';
COMMENT ON COLUMN item_tier_scores.avg_score   IS 'Numeric average: S=6 A=5 B=4 C=3 D=2 F=1';
