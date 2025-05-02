-- Make the profile-pictures bucket public
UPDATE storage.buckets
SET public = true
WHERE name = 'profile-pictures';

-- Try alternate CORS configuration
-- This part might not work depending on your Supabase version, but the policies will still help

-- Enable RLS for the bucket but ensure public access
CREATE POLICY "Public Access to profile-pictures"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'profile-pictures');

-- Ensure authenticated users can upload
CREATE POLICY "Authenticated users can upload to profile-pictures"
ON storage.objects
FOR INSERT 
TO authenticated
WITH CHECK (bucket_id = 'profile-pictures');

-- Check if policies were created successfully
SELECT *
FROM pg_policies
WHERE tablename = 'objects'
AND schemaname = 'storage'; 