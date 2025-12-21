-- Create Supabase Storage bucket for manim videos (simplified - no database table needed)

-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'manim-videos',
    'manim-videos',
    true,
    104857600, -- 100MB limit
    ARRAY['video/mp4']
)
ON CONFLICT (id) DO NOTHING;

-- Policy: Allow authenticated users to upload videos
CREATE POLICY "Authenticated users can upload videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'manim-videos');

-- Policy: Allow public read access to videos (for viewing/downloading)
CREATE POLICY "Public can view videos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'manim-videos');

-- Policy: Allow authenticated users to delete videos
CREATE POLICY "Authenticated users can delete videos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'manim-videos');
