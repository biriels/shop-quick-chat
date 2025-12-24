-- Add a policy so only admins can delete storage files (the upload policy was already created)
CREATE POLICY "Only admins can delete business images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'business-images' 
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);