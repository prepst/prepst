-- Migration: Create Storage Bucket for Feedback Attachments
-- Description: Create a public storage bucket for user-submitted feedback screenshots

-- Create the storage bucket for feedback attachments
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'feedback-attachments',
    'feedback-attachments',
    true,
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Create policy to allow authenticated users to upload their own feedback attachments
CREATE POLICY "Users can upload their own feedback attachments"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'feedback-attachments' AND
    (storage.foldername(name))[1] = concat('user-', auth.uid()::text)
);

-- Create policy to allow public read access to feedback attachments
CREATE POLICY "Public read access to feedback attachments"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'feedback-attachments');

-- Create policy to allow users to delete their own feedback attachments
CREATE POLICY "Users can delete their own feedback attachments"
ON storage.objects
FOR DELETE
TO authenticated
USING (
    bucket_id = 'feedback-attachments' AND
    (storage.foldername(name))[1] = concat('user-', auth.uid()::text)
);
