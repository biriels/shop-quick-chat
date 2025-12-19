-- Drop permissive policies on businesses table
DROP POLICY IF EXISTS "Allow all inserts on businesses" ON public.businesses;
DROP POLICY IF EXISTS "Allow all updates on businesses" ON public.businesses;
DROP POLICY IF EXISTS "Allow all deletes on businesses" ON public.businesses;

-- Drop permissive policies on posts table
DROP POLICY IF EXISTS "Allow all inserts on posts" ON public.posts;
DROP POLICY IF EXISTS "Allow all updates on posts" ON public.posts;
DROP POLICY IF EXISTS "Allow all deletes on posts" ON public.posts;

-- Create admin-only policies for businesses
CREATE POLICY "Only admins can insert businesses"
ON public.businesses FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update businesses"
ON public.businesses FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete businesses"
ON public.businesses FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create admin-only policies for posts
CREATE POLICY "Only admins can insert posts"
ON public.posts FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update posts"
ON public.posts FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete posts"
ON public.posts FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));