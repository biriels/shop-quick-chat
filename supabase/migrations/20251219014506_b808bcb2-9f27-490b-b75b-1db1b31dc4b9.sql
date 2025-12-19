-- Create storage bucket for business submission images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('business-images', 'business-images', true);

-- Allow anyone to upload images to the bucket
CREATE POLICY "Anyone can upload business images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'business-images');

-- Allow anyone to view images
CREATE POLICY "Anyone can view business images"
ON storage.objects FOR SELECT
USING (bucket_id = 'business-images');

-- Allow admins to delete images
CREATE POLICY "Admins can delete business images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'business-images' AND public.has_role(auth.uid(), 'admin'));

-- Create business submissions table
CREATE TABLE public.business_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_name TEXT NOT NULL,
  whatsapp_number TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  product_images TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewer_notes TEXT
);

-- Enable RLS
ALTER TABLE public.business_submissions ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a business (insert)
CREATE POLICY "Anyone can submit a business"
ON public.business_submissions FOR INSERT
WITH CHECK (true);

-- Only admins can view submissions
CREATE POLICY "Only admins can view submissions"
ON public.business_submissions FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can update submissions (approve/reject)
CREATE POLICY "Only admins can update submissions"
ON public.business_submissions FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Only admins can delete submissions
CREATE POLICY "Only admins can delete submissions"
ON public.business_submissions FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));