-- Create Supabase Storage bucket for manim videos
-- Note: This needs to be run in Supabase Dashboard > Storage > Create Bucket
-- Or via Supabase CLI: supabase storage create manim-videos --public

-- Storage bucket policies (run after creating bucket)
-- Allow authenticated users to upload videos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'manim-videos',
    'manim-videos',
    true,
    52428800, -- 50MB limit
    ARRAY['video/mp4']
)
ON CONFLICT (id) DO NOTHING;

-- Policy: Allow authenticated users to upload videos
CREATE POLICY "Authenticated users can upload videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'manim-videos');

-- Policy: Allow public read access to videos
CREATE POLICY "Public can view videos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'manim-videos');

-- Policy: Allow users to delete their own videos
CREATE POLICY "Users can delete their own videos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'manim-videos' AND (storage.foldername(name))[1] = auth.uid()::text);

