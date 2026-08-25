
-- Create cad-uploads storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('cad-uploads', 'cad-uploads', true);

-- Allow anonymous uploads
CREATE POLICY "Allow public upload to cad-uploads"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'cad-uploads');

-- Allow public read
CREATE POLICY "Allow public read from cad-uploads"
ON storage.objects FOR SELECT
USING (bucket_id = 'cad-uploads');
