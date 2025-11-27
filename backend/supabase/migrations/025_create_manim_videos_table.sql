-- Create manim_videos table to store generated video metadata
CREATE TABLE IF NOT EXISTS manim_videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    question_normalized TEXT NOT NULL, -- Normalized version for similarity matching
    video_url TEXT NOT NULL,
    storage_path TEXT NOT NULL, -- Path in Supabase Storage
    scene_id TEXT UNIQUE NOT NULL, -- Unique identifier for the scene
    file_size BIGINT, -- Size in bytes
    duration_seconds INTEGER, -- Video duration if available
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Indexes for fast lookups
    CONSTRAINT manim_videos_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_manim_videos_user_id ON manim_videos(user_id);
CREATE INDEX IF NOT EXISTS idx_manim_videos_question_normalized ON manim_videos(question_normalized);
CREATE INDEX IF NOT EXISTS idx_manim_videos_created_at ON manim_videos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_manim_videos_scene_id ON manim_videos(scene_id);

-- Create a GIN index for full-text search on questions (for similarity matching)
CREATE INDEX IF NOT EXISTS idx_manim_videos_question_gin ON manim_videos USING gin(to_tsvector('english', question));

-- Function to normalize question text (lowercase, remove punctuation, etc.)
CREATE OR REPLACE FUNCTION normalize_question(question_text TEXT)
RETURNS TEXT AS $$
BEGIN
    -- Convert to lowercase, remove extra spaces, remove common punctuation
    RETURN lower(regexp_replace(regexp_replace(question_text, '[^\w\s]', '', 'g'), '\s+', ' ', 'g'));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_manim_videos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_manim_videos_updated_at
    BEFORE UPDATE ON manim_videos
    FOR EACH ROW
    EXECUTE FUNCTION update_manim_videos_updated_at();

-- RLS Policies
ALTER TABLE manim_videos ENABLE ROW LEVEL SECURITY;

-- Users can view all videos (for similarity matching)
CREATE POLICY "Users can view all videos"
    ON manim_videos FOR SELECT
    USING (true);

-- Users can insert their own videos
CREATE POLICY "Users can insert their own videos"
    ON manim_videos FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own videos
CREATE POLICY "Users can update their own videos"
    ON manim_videos FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can delete their own videos
CREATE POLICY "Users can delete their own videos"
    ON manim_videos FOR DELETE
    USING (auth.uid() = user_id);

-- Function to find similar videos based on question similarity
CREATE OR REPLACE FUNCTION find_similar_manim_videos(
    search_question TEXT,
    similarity_threshold FLOAT DEFAULT 0.7,
    max_results INTEGER DEFAULT 5
)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    question TEXT,
    video_url TEXT,
    similarity_score FLOAT,
    created_at TIMESTAMPTZ
) AS $$
DECLARE
    normalized_search TEXT;
BEGIN
    normalized_search := normalize_question(search_question);
    
    RETURN QUERY
    SELECT 
        mv.id,
        mv.user_id,
        mv.question,
        mv.video_url,
        -- Calculate similarity using trigram similarity (requires pg_trgm extension)
        -- Fallback to simple text matching if pg_trgm not available
        CASE 
            WHEN mv.question_normalized = normalized_search THEN 1.0
            WHEN mv.question_normalized LIKE '%' || normalized_search || '%' THEN 0.8
            WHEN normalized_search LIKE '%' || mv.question_normalized || '%' THEN 0.8
            ELSE 0.5
        END as similarity_score,
        mv.created_at
    FROM manim_videos mv
    WHERE 
        -- Exact match
        mv.question_normalized = normalized_search
        OR
        -- Partial match
        mv.question_normalized LIKE '%' || normalized_search || '%'
        OR
        normalized_search LIKE '%' || mv.question_normalized || '%'
    ORDER BY similarity_score DESC, mv.created_at DESC
    LIMIT max_results;
END;
$$ LANGUAGE plpgsql;

