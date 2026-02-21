-- ============================================================
-- BUILDS SYSTEM - Complete Migration
-- TBOI Codex: Forum-lite Feed System
-- Created: 2026-01-28
-- ============================================================

-- ============================================================
-- A) DATA MODEL - TABLES
-- ============================================================

-- 1) build_posts - Main posts table
CREATE TABLE IF NOT EXISTS public.build_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL CONSTRAINT title_length CHECK (char_length(title) BETWEEN 3 AND 60),
    description TEXT NOT NULL CONSTRAINT description_length CHECK (char_length(description) BETWEEN 10 AND 5000),
    how_to_execute TEXT NOT NULL CONSTRAINT how_to_execute_length CHECK (char_length(how_to_execute) BETWEEN 10 AND 3000),
    notes TEXT NULL CONSTRAINT notes_length CHECK (notes IS NULL OR char_length(notes) <= 2000),
    character_slug TEXT NOT NULL,
    game_version TEXT NOT NULL DEFAULT 'repentance_plus',
    seed TEXT NULL CONSTRAINT seed_format CHECK (seed IS NULL OR seed ~ '^[A-Z0-9]{8}$'),
    difficulty TEXT NOT NULL DEFAULT 'normal' CONSTRAINT valid_difficulty CHECK (difficulty IN ('normal', 'hard', 'greed', 'greedier')),
    build_type TEXT NOT NULL DEFAULT 'damage' CONSTRAINT valid_build_type CHECK (build_type IN ('damage', 'survival', 'fun_meme', 'challenge', 'speedrun', 'synergy')),
    status TEXT NOT NULL DEFAULT 'published' CONSTRAINT valid_status CHECK (status IN ('published', 'pending', 'hidden', 'deleted')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    score INT NOT NULL DEFAULT 0,
    reports_count INT NOT NULL DEFAULT 0,
    comments_count INT NOT NULL DEFAULT 0,
    saves_count INT NOT NULL DEFAULT 0
);

-- Indexes for build_posts
CREATE INDEX IF NOT EXISTS idx_build_posts_created_at ON public.build_posts (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_build_posts_score ON public.build_posts (score DESC);
CREATE INDEX IF NOT EXISTS idx_build_posts_character ON public.build_posts (character_slug);
CREATE INDEX IF NOT EXISTS idx_build_posts_version ON public.build_posts (game_version);
CREATE INDEX IF NOT EXISTS idx_build_posts_difficulty ON public.build_posts (difficulty);
CREATE INDEX IF NOT EXISTS idx_build_posts_type ON public.build_posts (build_type);
CREATE INDEX IF NOT EXISTS idx_build_posts_status ON public.build_posts (status);
CREATE INDEX IF NOT EXISTS idx_build_posts_author ON public.build_posts (author_id);
-- Composite index for feed queries
CREATE INDEX IF NOT EXISTS idx_build_posts_feed ON public.build_posts (status, created_at DESC) WHERE status = 'published';
-- Hot score calculation index (score + recency)
CREATE INDEX IF NOT EXISTS idx_build_posts_hot ON public.build_posts (status, score DESC, created_at DESC) WHERE status = 'published';

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_build_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_build_posts_updated_at ON public.build_posts;
CREATE TRIGGER trigger_build_posts_updated_at
    BEFORE UPDATE ON public.build_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_build_posts_updated_at();

-- 2) build_post_tags - Tags for posts
CREATE TABLE IF NOT EXISTS public.build_post_tags (
    post_id UUID NOT NULL REFERENCES public.build_posts(id) ON DELETE CASCADE,
    tag TEXT NOT NULL CONSTRAINT tag_format CHECK (char_length(tag) BETWEEN 2 AND 30),
    created_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (post_id, tag)
);

CREATE INDEX IF NOT EXISTS idx_build_post_tags_tag ON public.build_post_tags (tag);
CREATE INDEX IF NOT EXISTS idx_build_post_tags_post ON public.build_post_tags (post_id);

-- 3) build_post_items - Items in builds (referencing codex_items)
CREATE TABLE IF NOT EXISTS public.build_post_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.build_posts(id) ON DELETE CASCADE,
    item_external_id TEXT NOT NULL, -- References external_id from codex_items
    position INT NOT NULL DEFAULT 0,
    is_essential BOOLEAN DEFAULT false,
    notes TEXT NULL,
    UNIQUE (post_id, item_external_id)
);

CREATE INDEX IF NOT EXISTS idx_build_post_items_item ON public.build_post_items (item_external_id);
CREATE INDEX IF NOT EXISTS idx_build_post_items_post ON public.build_post_items (post_id);

-- 4) build_media - Media attachments
CREATE TABLE IF NOT EXISTS public.build_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.build_posts(id) ON DELETE CASCADE,
    type TEXT NOT NULL CONSTRAINT valid_media_type CHECK (type IN ('image', 'gif', 'external')),
    storage_path TEXT NULL,
    external_url TEXT NULL,
    thumb_storage_path TEXT NULL,
    width INT NULL,
    height INT NULL,
    bytes INT NULL,
    mime TEXT NULL,
    position INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    -- Validation: external requires external_url, image/gif requires storage_path
    CONSTRAINT media_path_check CHECK (
        (type = 'external' AND external_url IS NOT NULL) OR
        (type IN ('image', 'gif') AND storage_path IS NOT NULL)
    )
);

CREATE INDEX IF NOT EXISTS idx_build_media_post ON public.build_media (post_id);

-- 5) build_comments - Comments on posts
CREATE TABLE IF NOT EXISTS public.build_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.build_posts(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    parent_id UUID NULL REFERENCES public.build_comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL CONSTRAINT content_length CHECK (char_length(content) BETWEEN 1 AND 2000),
    status TEXT NOT NULL DEFAULT 'published' CONSTRAINT valid_comment_status CHECK (status IN ('published', 'hidden', 'deleted')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_build_comments_post ON public.build_comments (post_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_build_comments_author ON public.build_comments (author_id);
CREATE INDEX IF NOT EXISTS idx_build_comments_parent ON public.build_comments (parent_id) WHERE parent_id IS NOT NULL;

-- Trigger for comments updated_at
DROP TRIGGER IF EXISTS trigger_build_comments_updated_at ON public.build_comments;
CREATE TRIGGER trigger_build_comments_updated_at
    BEFORE UPDATE ON public.build_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_build_posts_updated_at();

-- 6) build_votes - Upvotes on posts
CREATE TABLE IF NOT EXISTS public.build_votes (
    post_id UUID NOT NULL REFERENCES public.build_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    value SMALLINT NOT NULL DEFAULT 1 CONSTRAINT valid_vote_value CHECK (value IN (-1, 1)),
    created_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (post_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_build_votes_post ON public.build_votes (post_id);
CREATE INDEX IF NOT EXISTS idx_build_votes_user ON public.build_votes (user_id);

-- 7) build_saves - Bookmarks/saves
CREATE TABLE IF NOT EXISTS public.build_saves (
    post_id UUID NOT NULL REFERENCES public.build_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (post_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_build_saves_user ON public.build_saves (user_id);
CREATE INDEX IF NOT EXISTS idx_build_saves_post ON public.build_saves (post_id);

-- 8) user_blocks - Block users
CREATE TABLE IF NOT EXISTS public.user_blocks (
    blocker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    blocked_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (blocker_id, blocked_id),
    CONSTRAINT no_self_block CHECK (blocker_id != blocked_id)
);

CREATE INDEX IF NOT EXISTS idx_user_blocks_blocker ON public.user_blocks (blocker_id);
CREATE INDEX IF NOT EXISTS idx_user_blocks_blocked ON public.user_blocks (blocked_id);

-- 9) content_reports - Report system
CREATE TABLE IF NOT EXISTS public.content_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    target_type TEXT NOT NULL CONSTRAINT valid_target_type CHECK (target_type IN ('post', 'comment', 'user')),
    target_id UUID NOT NULL,
    reason TEXT NOT NULL CONSTRAINT reason_length CHECK (char_length(reason) BETWEEN 10 AND 500),
    details TEXT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    status TEXT NOT NULL DEFAULT 'open' CONSTRAINT valid_report_status CHECK (status IN ('open', 'reviewed', 'actioned', 'dismissed')),
    reviewed_by UUID NULL REFERENCES auth.users(id),
    reviewed_at TIMESTAMPTZ NULL,
    UNIQUE (reporter_id, target_type, target_id)
);

CREATE INDEX IF NOT EXISTS idx_content_reports_status ON public.content_reports (status) WHERE status = 'open';
CREATE INDEX IF NOT EXISTS idx_content_reports_target ON public.content_reports (target_type, target_id);

-- 10) user_profiles - Extended user info (if not exists)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE,
    display_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    reputation INT NOT NULL DEFAULT 0,
    is_admin BOOLEAN DEFAULT false,
    is_moderator BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON public.user_profiles (username);

-- ============================================================
-- B) TRIGGERS FOR COUNTERS
-- ============================================================

-- Trigger function to update comments_count
CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.build_posts 
        SET comments_count = comments_count + 1 
        WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.build_posts 
        SET comments_count = GREATEST(0, comments_count - 1) 
        WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_update_comments_count ON public.build_comments;
CREATE TRIGGER trigger_update_comments_count
    AFTER INSERT OR DELETE ON public.build_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_post_comments_count();

-- Trigger function to update score from votes
CREATE OR REPLACE FUNCTION update_post_score()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.build_posts 
        SET score = score + NEW.value 
        WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.build_posts 
        SET score = score - OLD.value 
        WHERE id = OLD.post_id;
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        UPDATE public.build_posts 
        SET score = score - OLD.value + NEW.value 
        WHERE id = NEW.post_id;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_update_post_score ON public.build_votes;
CREATE TRIGGER trigger_update_post_score
    AFTER INSERT OR UPDATE OR DELETE ON public.build_votes
    FOR EACH ROW
    EXECUTE FUNCTION update_post_score();

-- Trigger function to update saves_count
CREATE OR REPLACE FUNCTION update_post_saves_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.build_posts 
        SET saves_count = saves_count + 1 
        WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.build_posts 
        SET saves_count = GREATEST(0, saves_count - 1) 
        WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_update_saves_count ON public.build_saves;
CREATE TRIGGER trigger_update_saves_count
    AFTER INSERT OR DELETE ON public.build_saves
    FOR EACH ROW
    EXECUTE FUNCTION update_post_saves_count();

-- Trigger function to update reports_count and auto-hide
CREATE OR REPLACE FUNCTION update_post_reports_count()
RETURNS TRIGGER AS $$
DECLARE
    current_count INT;
    hide_threshold INT := 5; -- Hide after 5 reports
BEGIN
    IF TG_OP = 'INSERT' AND NEW.target_type = 'post' THEN
        UPDATE public.build_posts 
        SET reports_count = reports_count + 1 
        WHERE id = NEW.target_id
        RETURNING reports_count INTO current_count;
        
        -- Auto-hide if threshold reached
        IF current_count >= hide_threshold THEN
            UPDATE public.build_posts 
            SET status = 'hidden' 
            WHERE id = NEW.target_id AND status = 'published';
        END IF;
        
        RETURN NEW;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_update_reports_count ON public.content_reports;
CREATE TRIGGER trigger_update_reports_count
    AFTER INSERT ON public.content_reports
    FOR EACH ROW
    EXECUTE FUNCTION update_post_reports_count();

-- ============================================================
-- C) ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.build_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.build_post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.build_post_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.build_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.build_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.build_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.build_saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin/moderator
CREATE OR REPLACE FUNCTION is_admin_or_mod()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_profiles 
        WHERE id = auth.uid() 
        AND (is_admin = true OR is_moderator = true)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Helper function to check if user is blocked
CREATE OR REPLACE FUNCTION is_blocked_by(author_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    IF auth.uid() IS NULL THEN
        RETURN false;
    END IF;
    RETURN EXISTS (
        SELECT 1 FROM public.user_blocks
        WHERE blocker_id = auth.uid() AND blocked_id = author_uuid
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================================
-- RLS Policies for build_posts
-- ============================================================

-- SELECT: Public read for published posts (excluding blocked authors)
DROP POLICY IF EXISTS "build_posts_select_public" ON public.build_posts;
CREATE POLICY "build_posts_select_public" ON public.build_posts
    FOR SELECT
    TO anon, authenticated
    USING (
        status = 'published' 
        AND NOT is_blocked_by(author_id)
    );

-- SELECT: Authors can see their own posts regardless of status
DROP POLICY IF EXISTS "build_posts_select_own" ON public.build_posts;
CREATE POLICY "build_posts_select_own" ON public.build_posts
    FOR SELECT
    TO authenticated
    USING (author_id = auth.uid());

-- SELECT: Admins can see all posts
DROP POLICY IF EXISTS "build_posts_select_admin" ON public.build_posts;
CREATE POLICY "build_posts_select_admin" ON public.build_posts
    FOR SELECT
    TO authenticated
    USING (is_admin_or_mod());

-- INSERT: Only authenticated users
DROP POLICY IF EXISTS "build_posts_insert" ON public.build_posts;
CREATE POLICY "build_posts_insert" ON public.build_posts
    FOR INSERT
    TO authenticated
    WITH CHECK (author_id = auth.uid());

-- UPDATE: Only author or admin
DROP POLICY IF EXISTS "build_posts_update" ON public.build_posts;
CREATE POLICY "build_posts_update" ON public.build_posts
    FOR UPDATE
    TO authenticated
    USING (author_id = auth.uid() OR is_admin_or_mod())
    WITH CHECK (author_id = auth.uid() OR is_admin_or_mod());

-- DELETE: Only author or admin
DROP POLICY IF EXISTS "build_posts_delete" ON public.build_posts;
CREATE POLICY "build_posts_delete" ON public.build_posts
    FOR DELETE
    TO authenticated
    USING (author_id = auth.uid() OR is_admin_or_mod());

-- ============================================================
-- RLS Policies for build_post_tags
-- ============================================================

-- SELECT: Public if post is published
DROP POLICY IF EXISTS "build_post_tags_select" ON public.build_post_tags;
CREATE POLICY "build_post_tags_select" ON public.build_post_tags
    FOR SELECT
    TO anon, authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.build_posts bp
            WHERE bp.id = post_id 
            AND (bp.status = 'published' OR bp.author_id = auth.uid())
        )
    );

-- INSERT: Only post author
DROP POLICY IF EXISTS "build_post_tags_insert" ON public.build_post_tags;
CREATE POLICY "build_post_tags_insert" ON public.build_post_tags
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.build_posts bp
            WHERE bp.id = post_id AND bp.author_id = auth.uid()
        )
    );

-- DELETE: Only post author or admin
DROP POLICY IF EXISTS "build_post_tags_delete" ON public.build_post_tags;
CREATE POLICY "build_post_tags_delete" ON public.build_post_tags
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.build_posts bp
            WHERE bp.id = post_id AND (bp.author_id = auth.uid() OR is_admin_or_mod())
        )
    );

-- ============================================================
-- RLS Policies for build_post_items
-- ============================================================

DROP POLICY IF EXISTS "build_post_items_select" ON public.build_post_items;
CREATE POLICY "build_post_items_select" ON public.build_post_items
    FOR SELECT
    TO anon, authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.build_posts bp
            WHERE bp.id = post_id 
            AND (bp.status = 'published' OR bp.author_id = auth.uid())
        )
    );

DROP POLICY IF EXISTS "build_post_items_insert" ON public.build_post_items;
CREATE POLICY "build_post_items_insert" ON public.build_post_items
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.build_posts bp
            WHERE bp.id = post_id AND bp.author_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "build_post_items_update" ON public.build_post_items;
CREATE POLICY "build_post_items_update" ON public.build_post_items
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.build_posts bp
            WHERE bp.id = post_id AND bp.author_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "build_post_items_delete" ON public.build_post_items;
CREATE POLICY "build_post_items_delete" ON public.build_post_items
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.build_posts bp
            WHERE bp.id = post_id AND (bp.author_id = auth.uid() OR is_admin_or_mod())
        )
    );

-- ============================================================
-- RLS Policies for build_media
-- ============================================================

DROP POLICY IF EXISTS "build_media_select" ON public.build_media;
CREATE POLICY "build_media_select" ON public.build_media
    FOR SELECT
    TO anon, authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.build_posts bp
            WHERE bp.id = post_id 
            AND (bp.status = 'published' OR bp.author_id = auth.uid())
        )
    );

DROP POLICY IF EXISTS "build_media_insert" ON public.build_media;
CREATE POLICY "build_media_insert" ON public.build_media
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.build_posts bp
            WHERE bp.id = post_id AND bp.author_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "build_media_delete" ON public.build_media;
CREATE POLICY "build_media_delete" ON public.build_media
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.build_posts bp
            WHERE bp.id = post_id AND (bp.author_id = auth.uid() OR is_admin_or_mod())
        )
    );

-- ============================================================
-- RLS Policies for build_comments
-- ============================================================

DROP POLICY IF EXISTS "build_comments_select_public" ON public.build_comments;
CREATE POLICY "build_comments_select_public" ON public.build_comments
    FOR SELECT
    TO anon, authenticated
    USING (
        status = 'published'
        AND NOT is_blocked_by(author_id)
        AND EXISTS (
            SELECT 1 FROM public.build_posts bp
            WHERE bp.id = post_id AND bp.status = 'published'
        )
    );

DROP POLICY IF EXISTS "build_comments_select_own" ON public.build_comments;
CREATE POLICY "build_comments_select_own" ON public.build_comments
    FOR SELECT
    TO authenticated
    USING (author_id = auth.uid());

DROP POLICY IF EXISTS "build_comments_insert" ON public.build_comments;
CREATE POLICY "build_comments_insert" ON public.build_comments
    FOR INSERT
    TO authenticated
    WITH CHECK (
        author_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.build_posts bp
            WHERE bp.id = post_id AND bp.status = 'published'
        )
    );

DROP POLICY IF EXISTS "build_comments_update" ON public.build_comments;
CREATE POLICY "build_comments_update" ON public.build_comments
    FOR UPDATE
    TO authenticated
    USING (author_id = auth.uid() OR is_admin_or_mod())
    WITH CHECK (author_id = auth.uid() OR is_admin_or_mod());

DROP POLICY IF EXISTS "build_comments_delete" ON public.build_comments;
CREATE POLICY "build_comments_delete" ON public.build_comments
    FOR DELETE
    TO authenticated
    USING (author_id = auth.uid() OR is_admin_or_mod());

-- ============================================================
-- RLS Policies for build_votes
-- ============================================================

-- SELECT: Users can see their own votes
DROP POLICY IF EXISTS "build_votes_select" ON public.build_votes;
CREATE POLICY "build_votes_select" ON public.build_votes
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "build_votes_insert" ON public.build_votes;
CREATE POLICY "build_votes_insert" ON public.build_votes
    FOR INSERT
    TO authenticated
    WITH CHECK (
        user_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.build_posts bp
            WHERE bp.id = post_id AND bp.status = 'published'
        )
    );

DROP POLICY IF EXISTS "build_votes_update" ON public.build_votes;
CREATE POLICY "build_votes_update" ON public.build_votes
    FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "build_votes_delete" ON public.build_votes;
CREATE POLICY "build_votes_delete" ON public.build_votes
    FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());

-- ============================================================
-- RLS Policies for build_saves
-- ============================================================

DROP POLICY IF EXISTS "build_saves_select" ON public.build_saves;
CREATE POLICY "build_saves_select" ON public.build_saves
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "build_saves_insert" ON public.build_saves;
CREATE POLICY "build_saves_insert" ON public.build_saves
    FOR INSERT
    TO authenticated
    WITH CHECK (
        user_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.build_posts bp
            WHERE bp.id = post_id AND bp.status = 'published'
        )
    );

DROP POLICY IF EXISTS "build_saves_delete" ON public.build_saves;
CREATE POLICY "build_saves_delete" ON public.build_saves
    FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());

-- ============================================================
-- RLS Policies for user_blocks
-- ============================================================

DROP POLICY IF EXISTS "user_blocks_select" ON public.user_blocks;
CREATE POLICY "user_blocks_select" ON public.user_blocks
    FOR SELECT
    TO authenticated
    USING (blocker_id = auth.uid());

DROP POLICY IF EXISTS "user_blocks_insert" ON public.user_blocks;
CREATE POLICY "user_blocks_insert" ON public.user_blocks
    FOR INSERT
    TO authenticated
    WITH CHECK (blocker_id = auth.uid());

DROP POLICY IF EXISTS "user_blocks_delete" ON public.user_blocks;
CREATE POLICY "user_blocks_delete" ON public.user_blocks
    FOR DELETE
    TO authenticated
    USING (blocker_id = auth.uid());

-- ============================================================
-- RLS Policies for content_reports
-- ============================================================

-- INSERT: Any authenticated user can report
DROP POLICY IF EXISTS "content_reports_insert" ON public.content_reports;
CREATE POLICY "content_reports_insert" ON public.content_reports
    FOR INSERT
    TO authenticated
    WITH CHECK (reporter_id = auth.uid());

-- SELECT: Reporter can see their own reports, admins see all
DROP POLICY IF EXISTS "content_reports_select_own" ON public.content_reports;
CREATE POLICY "content_reports_select_own" ON public.content_reports
    FOR SELECT
    TO authenticated
    USING (reporter_id = auth.uid() OR is_admin_or_mod());

-- UPDATE: Only admins can update reports (review)
DROP POLICY IF EXISTS "content_reports_update" ON public.content_reports;
CREATE POLICY "content_reports_update" ON public.content_reports
    FOR UPDATE
    TO authenticated
    USING (is_admin_or_mod())
    WITH CHECK (is_admin_or_mod());

-- ============================================================
-- RLS Policies for user_profiles
-- ============================================================

DROP POLICY IF EXISTS "user_profiles_select" ON public.user_profiles;
CREATE POLICY "user_profiles_select" ON public.user_profiles
    FOR SELECT
    TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "user_profiles_insert" ON public.user_profiles;
CREATE POLICY "user_profiles_insert" ON public.user_profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "user_profiles_update" ON public.user_profiles;
CREATE POLICY "user_profiles_update" ON public.user_profiles
    FOR UPDATE
    TO authenticated
    USING (id = auth.uid() OR is_admin_or_mod())
    WITH CHECK (id = auth.uid() OR is_admin_or_mod());

-- ============================================================
-- D) STORAGE BUCKET & POLICIES
-- ============================================================

-- Note: Run these in Supabase Dashboard or via supabase CLI
-- INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
-- VALUES (
--     'build-media',
--     'build-media', 
--     true,  -- Public bucket for easy CDN access
--     10485760,  -- 10MB limit per file
--     ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
-- )
-- ON CONFLICT (id) DO UPDATE SET
--     public = EXCLUDED.public,
--     file_size_limit = EXCLUDED.file_size_limit,
--     allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage Policies (run in Dashboard SQL Editor)
-- 
-- -- Allow public read access
-- CREATE POLICY "build_media_public_read"
-- ON storage.objects FOR SELECT
-- TO anon, authenticated
-- USING (bucket_id = 'build-media');
--
-- -- Allow authenticated users to upload to their folder
-- CREATE POLICY "build_media_auth_insert"
-- ON storage.objects FOR INSERT
-- TO authenticated
-- WITH CHECK (
--     bucket_id = 'build-media' 
--     AND (storage.foldername(name))[1] = auth.uid()::text
-- );
--
-- -- Allow users to delete their own files
-- CREATE POLICY "build_media_auth_delete"
-- ON storage.objects FOR DELETE
-- TO authenticated
-- USING (
--     bucket_id = 'build-media'
--     AND (storage.foldername(name))[1] = auth.uid()::text
-- );

-- ============================================================
-- E) RPC FUNCTIONS FOR FEED QUERIES
-- ============================================================

-- Function to get builds feed with efficient pagination
CREATE OR REPLACE FUNCTION get_builds_feed(
    p_sort TEXT DEFAULT 'new',
    p_character TEXT DEFAULT NULL,
    p_game_version TEXT DEFAULT NULL,
    p_difficulty TEXT DEFAULT NULL,
    p_build_type TEXT DEFAULT NULL,
    p_tags TEXT[] DEFAULT NULL,
    p_search TEXT DEFAULT NULL,
    p_cursor TIMESTAMPTZ DEFAULT NULL,
    p_cursor_score INT DEFAULT NULL,
    p_limit INT DEFAULT 20
)
RETURNS TABLE (
    id UUID,
    author_id UUID,
    author_username TEXT,
    author_avatar TEXT,
    title TEXT,
    description TEXT,
    character_slug TEXT,
    game_version TEXT,
    seed TEXT,
    difficulty TEXT,
    build_type TEXT,
    status TEXT,
    created_at TIMESTAMPTZ,
    score INT,
    comments_count INT,
    saves_count INT,
    tags TEXT[],
    thumbnail_url TEXT,
    user_voted BOOLEAN,
    user_saved BOOLEAN
) AS $$
DECLARE
    v_user_id UUID := auth.uid();
BEGIN
    RETURN QUERY
    WITH post_tags AS (
        SELECT pt.post_id, array_agg(pt.tag) as tags
        FROM build_post_tags pt
        GROUP BY pt.post_id
    ),
    post_thumbnails AS (
        SELECT DISTINCT ON (bm.post_id) bm.post_id, 
            COALESCE(bm.thumb_storage_path, bm.storage_path, bm.external_url) as thumb
        FROM build_media bm
        ORDER BY bm.post_id, bm.position ASC
    )
    SELECT 
        bp.id,
        bp.author_id,
        COALESCE(up.username, up.display_name, 'Anonymous') as author_username,
        up.avatar_url as author_avatar,
        bp.title,
        LEFT(bp.description, 200) as description,
        bp.character_slug,
        bp.game_version,
        bp.seed,
        bp.difficulty,
        bp.build_type,
        bp.status,
        bp.created_at,
        bp.score,
        bp.comments_count,
        bp.saves_count,
        COALESCE(pt.tags, ARRAY[]::TEXT[]) as tags,
        pth.thumb as thumbnail_url,
        CASE WHEN v_user_id IS NOT NULL THEN 
            EXISTS(SELECT 1 FROM build_votes bv WHERE bv.post_id = bp.id AND bv.user_id = v_user_id)
        ELSE false END as user_voted,
        CASE WHEN v_user_id IS NOT NULL THEN
            EXISTS(SELECT 1 FROM build_saves bs WHERE bs.post_id = bp.id AND bs.user_id = v_user_id)
        ELSE false END as user_saved
    FROM build_posts bp
    LEFT JOIN user_profiles up ON up.id = bp.author_id
    LEFT JOIN post_tags pt ON pt.post_id = bp.id
    LEFT JOIN post_thumbnails pth ON pth.post_id = bp.id
    WHERE bp.status = 'published'
        AND (v_user_id IS NULL OR NOT EXISTS (
            SELECT 1 FROM user_blocks ub 
            WHERE ub.blocker_id = v_user_id AND ub.blocked_id = bp.author_id
        ))
        AND (p_character IS NULL OR bp.character_slug = p_character)
        AND (p_game_version IS NULL OR bp.game_version = p_game_version)
        AND (p_difficulty IS NULL OR bp.difficulty = p_difficulty)
        AND (p_build_type IS NULL OR bp.build_type = p_build_type)
        AND (p_tags IS NULL OR pt.tags && p_tags)
        AND (p_search IS NULL OR bp.title ILIKE '%' || p_search || '%')
        AND (
            CASE 
                WHEN p_sort = 'new' THEN
                    p_cursor IS NULL OR bp.created_at < p_cursor
                WHEN p_sort = 'top' THEN
                    p_cursor_score IS NULL OR 
                    (bp.score < p_cursor_score) OR 
                    (bp.score = p_cursor_score AND bp.created_at < p_cursor)
                WHEN p_sort = 'hot' THEN
                    p_cursor IS NULL OR bp.created_at < p_cursor
                ELSE true
            END
        )
    ORDER BY 
        CASE 
            WHEN p_sort = 'new' THEN bp.created_at
            WHEN p_sort = 'hot' THEN bp.created_at
        END DESC NULLS LAST,
        CASE WHEN p_sort = 'top' THEN bp.score END DESC NULLS LAST,
        bp.created_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Function to get single build with all details
CREATE OR REPLACE FUNCTION get_build_detail(p_build_id UUID)
RETURNS TABLE (
    id UUID,
    author_id UUID,
    author_username TEXT,
    author_avatar TEXT,
    title TEXT,
    description TEXT,
    how_to_execute TEXT,
    notes TEXT,
    character_slug TEXT,
    game_version TEXT,
    seed TEXT,
    difficulty TEXT,
    build_type TEXT,
    status TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    score INT,
    comments_count INT,
    saves_count INT,
    user_voted BOOLEAN,
    user_vote_value INT,
    user_saved BOOLEAN,
    is_author BOOLEAN
) AS $$
DECLARE
    v_user_id UUID := auth.uid();
BEGIN
    RETURN QUERY
    SELECT 
        bp.id,
        bp.author_id,
        COALESCE(up.username, up.display_name, 'Anonymous'),
        up.avatar_url,
        bp.title,
        bp.description,
        bp.how_to_execute,
        bp.notes,
        bp.character_slug,
        bp.game_version,
        bp.seed,
        bp.difficulty,
        bp.build_type,
        bp.status,
        bp.created_at,
        bp.updated_at,
        bp.score,
        bp.comments_count,
        bp.saves_count,
        CASE WHEN v_user_id IS NOT NULL THEN 
            EXISTS(SELECT 1 FROM build_votes bv WHERE bv.post_id = bp.id AND bv.user_id = v_user_id)
        ELSE false END,
        (SELECT bv.value FROM build_votes bv WHERE bv.post_id = bp.id AND bv.user_id = v_user_id),
        CASE WHEN v_user_id IS NOT NULL THEN
            EXISTS(SELECT 1 FROM build_saves bs WHERE bs.post_id = bp.id AND bs.user_id = v_user_id)
        ELSE false END,
        bp.author_id = v_user_id
    FROM build_posts bp
    LEFT JOIN user_profiles up ON up.id = bp.author_id
    WHERE bp.id = p_build_id
        AND (bp.status = 'published' OR bp.author_id = v_user_id OR is_admin_or_mod());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Function to toggle vote
CREATE OR REPLACE FUNCTION toggle_build_vote(p_post_id UUID, p_value INT DEFAULT 1)
RETURNS JSON AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_existing_vote INT;
    v_new_score INT;
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;
    
    -- Check if vote exists
    SELECT value INTO v_existing_vote 
    FROM build_votes 
    WHERE post_id = p_post_id AND user_id = v_user_id;
    
    IF v_existing_vote IS NOT NULL THEN
        -- Remove existing vote
        DELETE FROM build_votes WHERE post_id = p_post_id AND user_id = v_user_id;
        SELECT score INTO v_new_score FROM build_posts WHERE id = p_post_id;
        RETURN json_build_object('voted', false, 'score', v_new_score);
    ELSE
        -- Add new vote
        INSERT INTO build_votes (post_id, user_id, value) VALUES (p_post_id, v_user_id, p_value);
        SELECT score INTO v_new_score FROM build_posts WHERE id = p_post_id;
        RETURN json_build_object('voted', true, 'score', v_new_score);
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to toggle save
CREATE OR REPLACE FUNCTION toggle_build_save(p_post_id UUID)
RETURNS JSON AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_exists BOOLEAN;
    v_new_count INT;
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;
    
    SELECT EXISTS(SELECT 1 FROM build_saves WHERE post_id = p_post_id AND user_id = v_user_id) INTO v_exists;
    
    IF v_exists THEN
        DELETE FROM build_saves WHERE post_id = p_post_id AND user_id = v_user_id;
        SELECT saves_count INTO v_new_count FROM build_posts WHERE id = p_post_id;
        RETURN json_build_object('saved', false, 'saves_count', v_new_count);
    ELSE
        INSERT INTO build_saves (post_id, user_id) VALUES (p_post_id, v_user_id);
        SELECT saves_count INTO v_new_count FROM build_posts WHERE id = p_post_id;
        RETURN json_build_object('saved', true, 'saves_count', v_new_count);
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_builds_feed TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_build_detail TO anon, authenticated;
GRANT EXECUTE ON FUNCTION toggle_build_vote TO authenticated;
GRANT EXECUTE ON FUNCTION toggle_build_save TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin_or_mod TO authenticated;
GRANT EXECUTE ON FUNCTION is_blocked_by TO anon, authenticated;

-- ============================================================
-- F) SEED SOME INITIAL DATA (Optional - for testing)
-- ============================================================

-- Uncomment below to seed test data
-- INSERT INTO public.user_profiles (id, username, display_name, reputation)
-- SELECT id, email, email, 0
-- FROM auth.users
-- ON CONFLICT (id) DO NOTHING;
