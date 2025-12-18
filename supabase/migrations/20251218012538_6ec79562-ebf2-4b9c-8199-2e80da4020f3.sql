-- Drop existing restrictive policies for businesses
DROP POLICY IF EXISTS "Only admins can insert businesses" ON public.businesses;
DROP POLICY IF EXISTS "Only admins can update businesses" ON public.businesses;
DROP POLICY IF EXISTS "Only admins can delete businesses" ON public.businesses;

-- Drop existing restrictive policies for posts
DROP POLICY IF EXISTS "Only admins can insert posts" ON public.posts;
DROP POLICY IF EXISTS "Only admins can update posts" ON public.posts;
DROP POLICY IF EXISTS "Only admins can delete posts" ON public.posts;

-- Create permissive policies for businesses (MVP - simple access)
CREATE POLICY "Allow all inserts on businesses"
ON public.businesses
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow all updates on businesses"
ON public.businesses
FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow all deletes on businesses"
ON public.businesses
FOR DELETE
USING (true);

-- Create permissive policies for posts (MVP - simple access)
CREATE POLICY "Allow all inserts on posts"
ON public.posts
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow all updates on posts"
ON public.posts
FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow all deletes on posts"
ON public.posts
FOR DELETE
USING (true);