-- =====================================================
-- Migration: Community Seeds Database
-- Players share seeds with votes, tags, version & platform
-- =====================================================

-- ─── Main seeds table ─────────────────────────────────────────────────────────

CREATE TABLE community_seeds (
    id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
    author_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    seed_code    TEXT        NOT NULL,
    title        TEXT        NOT NULL,
    description  TEXT,

    game_version TEXT        NOT NULL DEFAULT 'repentance_plus',
    platform     TEXT        NOT NULL DEFAULT 'pc',

    score        INT         NOT NULL DEFAULT 0,
    upvotes      INT         NOT NULL DEFAULT 0,
    downvotes    INT         NOT NULL DEFAULT 0,

    status       TEXT        NOT NULL DEFAULT 'published',
    created_at   TIMESTAMPTZ DEFAULT NOW(),
    updated_at   TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT valid_seed_code    CHECK (seed_code    ~ '^[A-Z0-9]{8}$'),
    CONSTRAINT valid_game_version CHECK (game_version IN
        ('repentance_plus', 'repentance', 'afterbirth_plus', 'rebirth')),
    CONSTRAINT valid_platform     CHECK (platform     IN
        ('pc', 'switch', 'playstation', 'xbox')),
    CONSTRAINT valid_status       CHECK (status       IN
        ('published', 'hidden', 'deleted')),
    CONSTRAINT seed_title_length  CHECK (char_length(title) BETWEEN 3 AND 60)
);

CREATE INDEX idx_seeds_score       ON community_seeds (score DESC);
CREATE INDEX idx_seeds_created     ON community_seeds (created_at DESC);
CREATE INDEX idx_seeds_version     ON community_seeds (game_version);
CREATE INDEX idx_seeds_platform    ON community_seeds (platform);
CREATE INDEX idx_seeds_version_plt ON community_seeds (game_version, platform);
CREATE INDEX idx_seeds_author      ON community_seeds (author_id);
CREATE INDEX idx_seeds_status      ON community_seeds (status);

-- ─── Tags (normalized) ────────────────────────────────────────────────────────

CREATE TABLE seed_tags (
    seed_id  UUID NOT NULL REFERENCES community_seeds(id) ON DELETE CASCADE,
    tag      TEXT NOT NULL CHECK (char_length(tag) BETWEEN 1 AND 40),
    PRIMARY KEY (seed_id, tag)
);

CREATE INDEX idx_seed_tags_tag ON seed_tags (tag);

-- ─── Votes ────────────────────────────────────────────────────────────────────

CREATE TABLE seed_votes (
    seed_id    UUID     NOT NULL REFERENCES community_seeds(id) ON DELETE CASCADE,
    user_id    UUID     NOT NULL REFERENCES auth.users(id)       ON DELETE CASCADE,
    value      SMALLINT NOT NULL CHECK (value IN (1, -1)),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (seed_id, user_id)
);

CREATE INDEX idx_seed_votes_seed ON seed_votes (seed_id);
CREATE INDEX idx_seed_votes_user ON seed_votes (user_id);

-- ─── Auto-update score trigger ────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_seed_score()
RETURNS TRIGGER AS $$
DECLARE
    v_seed_id UUID;
    v_up      INT;
    v_down    INT;
BEGIN
    v_seed_id := COALESCE(NEW.seed_id, OLD.seed_id);

    SELECT
        COUNT(*) FILTER (WHERE value =  1),
        COUNT(*) FILTER (WHERE value = -1)
    INTO v_up, v_down
    FROM seed_votes
    WHERE seed_id = v_seed_id;

    UPDATE community_seeds
    SET upvotes   = v_up,
        downvotes = v_down,
        score     = v_up - v_down,
        updated_at = NOW()
    WHERE id = v_seed_id;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_seed_score
    AFTER INSERT OR UPDATE OR DELETE ON seed_votes
    FOR EACH ROW EXECUTE FUNCTION update_seed_score();

-- ─── updated_at trigger ───────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_seed_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_seed_updated_at
    BEFORE UPDATE ON community_seeds
    FOR EACH ROW EXECUTE FUNCTION update_seed_updated_at();

-- ─── Row Level Security ───────────────────────────────────────────────────────

ALTER TABLE community_seeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE seed_tags       ENABLE ROW LEVEL SECURITY;
ALTER TABLE seed_votes      ENABLE ROW LEVEL SECURITY;

-- Seeds: public read, auth write
CREATE POLICY "Anyone can read published seeds"
    ON community_seeds FOR SELECT
    USING (status = 'published');

CREATE POLICY "Authors can insert own seeds"
    ON community_seeds FOR INSERT
    WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update own seeds"
    ON community_seeds FOR UPDATE
    USING (auth.uid() = author_id);

-- Tags: follow seed visibility
CREATE POLICY "Anyone can read seed tags"
    ON seed_tags FOR SELECT USING (true);

CREATE POLICY "Auth can insert seed tags"
    ON seed_tags FOR INSERT WITH CHECK (true);

-- Votes: anyone reads, auth writes own
CREATE POLICY "Anyone can read votes"
    ON seed_votes FOR SELECT USING (true);

CREATE POLICY "Users can insert own votes"
    ON seed_votes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own votes"
    ON seed_votes FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own votes"
    ON seed_votes FOR DELETE
    USING (auth.uid() = user_id);

-- ─── Comments ─────────────────────────────────────────────────────────────────

COMMENT ON TABLE  community_seeds          IS 'Community-shared TBOI seeds with votes and tags';
COMMENT ON COLUMN community_seeds.seed_code IS 'Exactly 8 uppercase alphanumeric chars, no spaces';
COMMENT ON COLUMN community_seeds.score     IS 'Cached upvotes - downvotes, updated by trigger';
COMMENT ON TABLE  seed_votes               IS 'One vote per user per seed; trigger keeps score in sync';
