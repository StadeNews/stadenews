-- Allow anyone to create categories (for user-submitted categories)
DROP POLICY IF EXISTS "Anyone can create categories" ON public.categories;
CREATE POLICY "Anyone can create categories" 
ON public.categories 
FOR INSERT 
WITH CHECK (true);