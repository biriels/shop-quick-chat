-- Create table to store fetched content from sources
CREATE TABLE public.fetched_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_id UUID NOT NULL REFERENCES public.sources(id) ON DELETE CASCADE,
  source_url TEXT NOT NULL,
  fetched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  raw_text TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  content_hash TEXT
);

-- Create index for efficient querying
CREATE INDEX idx_fetched_content_source_id ON public.fetched_content(source_id);
CREATE INDEX idx_fetched_content_fetched_at ON public.fetched_content(fetched_at DESC);

-- Enable RLS
ALTER TABLE public.fetched_content ENABLE ROW LEVEL SECURITY;

-- Only admins can view fetched content
CREATE POLICY "Only admins can view fetched content"
ON public.fetched_content FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Only service role can insert/update (for edge function)
CREATE POLICY "Service role can insert fetched content"
ON public.fetched_content FOR INSERT
WITH CHECK (true);

CREATE POLICY "Service role can update fetched content"
ON public.fetched_content FOR UPDATE
USING (true)
WITH CHECK (true);