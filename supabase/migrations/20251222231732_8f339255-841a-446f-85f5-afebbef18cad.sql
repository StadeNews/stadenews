-- Create spotted posts table
CREATE TABLE public.spotted (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  anonymous_author text,
  title text NOT NULL,
  content text NOT NULL,
  location text,
  spotted_date date,
  spotted_time text,
  likes_count integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.spotted ENABLE ROW LEVEL SECURITY;

-- Policies for spotted
CREATE POLICY "Anyone can view spotted posts"
ON public.spotted FOR SELECT
USING (true);

CREATE POLICY "Anyone can create spotted posts"
ON public.spotted FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can delete spotted posts"
ON public.spotted FOR DELETE
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update spotted posts"
ON public.spotted FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

-- Create spotted comments table
CREATE TABLE public.spotted_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  spotted_id uuid REFERENCES public.spotted(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  anonymous_author text,
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.spotted_comments ENABLE ROW LEVEL SECURITY;

-- Policies for spotted_comments
CREATE POLICY "Anyone can view spotted comments"
ON public.spotted_comments FOR SELECT
USING (true);

CREATE POLICY "Anyone can add spotted comments"
ON public.spotted_comments FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can delete spotted comments"
ON public.spotted_comments FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Create spotted likes table
CREATE TABLE public.spotted_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  spotted_id uuid REFERENCES public.spotted(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  anonymous_id text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT spotted_likes_unique UNIQUE (spotted_id, user_id),
  CONSTRAINT spotted_likes_anonymous_unique UNIQUE (spotted_id, anonymous_id)
);

-- Enable RLS
ALTER TABLE public.spotted_likes ENABLE ROW LEVEL SECURITY;

-- Policies for spotted_likes
CREATE POLICY "Anyone can view spotted likes"
ON public.spotted_likes FOR SELECT
USING (true);

CREATE POLICY "Anyone can add spotted likes"
ON public.spotted_likes FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can remove their own spotted likes"
ON public.spotted_likes FOR DELETE
USING ((auth.uid() IS NOT NULL AND user_id = auth.uid()) OR anonymous_id IS NOT NULL);

-- Create trigger to update likes count
CREATE OR REPLACE FUNCTION public.update_spotted_likes_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.spotted SET likes_count = likes_count + 1 WHERE id = NEW.spotted_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.spotted SET likes_count = likes_count - 1 WHERE id = OLD.spotted_id;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER update_spotted_likes_count_trigger
AFTER INSERT OR DELETE ON public.spotted_likes
FOR EACH ROW
EXECUTE FUNCTION public.update_spotted_likes_count();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.spotted;
ALTER PUBLICATION supabase_realtime ADD TABLE public.spotted_comments;