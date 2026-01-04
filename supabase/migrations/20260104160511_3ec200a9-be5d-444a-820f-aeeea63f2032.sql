-- Add product_images array column to posts table for multiple images
ALTER TABLE public.posts 
ADD COLUMN product_images text[] DEFAULT '{}'::text[];