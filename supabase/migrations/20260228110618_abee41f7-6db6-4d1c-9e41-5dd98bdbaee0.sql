-- Create storage bucket for project documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('project-documents', 'project-documents', true, 20971520, ARRAY['application/pdf']);

-- RLS policies for project-documents bucket
CREATE POLICY "Authenticated users can upload project documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'project-documents');

CREATE POLICY "Anyone can view project documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'project-documents');

CREATE POLICY "Authenticated users can update project documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'project-documents');

CREATE POLICY "Authenticated users can delete project documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'project-documents');

-- Add columns to projects table for file paths
ALTER TABLE public.projects
ADD COLUMN plans_pdf_path TEXT,
ADD COLUMN specs_pdf_path TEXT;