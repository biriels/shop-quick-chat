-- Create enum for source types
CREATE TYPE public.source_type AS ENUM ('forum', 'listing', 'group', 'website');

-- Create enum for keyword categories
CREATE TYPE public.keyword_category AS ENUM ('product', 'intent', 'location');

-- Create sources table for monitoring URLs
CREATE TABLE public.sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  source_type source_type NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on sources
ALTER TABLE public.sources ENABLE ROW LEVEL SECURITY;

-- Only admins can manage sources
CREATE POLICY "Only admins can view sources"
ON public.sources FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can insert sources"
ON public.sources FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update sources"
ON public.sources FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete sources"
ON public.sources FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Create keywords table
CREATE TABLE public.keywords (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  keyword TEXT NOT NULL,
  category keyword_category NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on keywords
ALTER TABLE public.keywords ENABLE ROW LEVEL SECURITY;

-- Only admins can manage keywords
CREATE POLICY "Only admins can view keywords"
ON public.keywords FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can insert keywords"
ON public.keywords FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update keywords"
ON public.keywords FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete keywords"
ON public.keywords FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Add trigger for updated_at on sources
CREATE TRIGGER update_sources_updated_at
BEFORE UPDATE ON public.sources
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();