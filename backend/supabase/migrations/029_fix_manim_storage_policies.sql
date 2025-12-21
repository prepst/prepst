-- Fix manim-videos storage bucket policies
-- Drop existing policies that might be causing issues

DROP POLICY IF EXISTS "Authenticated users can upload videos" ON storage.objects;
DROP POLICY IF EXISTS "Public can view videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own videos" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads to manim-videos" ON storage.objects;
DROP POLICY IF EXISTS "Public can view manim videos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete manim videos" ON storage.objects;

-- Create permissive policies for manim-videos bucket only

-- Allow all authenticated users to upload to manim-videos
CREATE POLICY "manim_videos_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'manim-videos');

-- Allow public to read from manim-videos
CREATE POLICY "manim_videos_select"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'manim-videos');

-- Allow authenticated users to delete from manim-videos
CREATE POLICY "manim_videos_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'manim-videos');
