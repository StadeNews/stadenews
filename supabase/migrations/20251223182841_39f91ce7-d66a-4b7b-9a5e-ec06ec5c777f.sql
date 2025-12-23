-- Add user_badges table for achievements
CREATE TABLE IF NOT EXISTS public.user_badges (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    badge_type text NOT NULL,
    badge_level integer NOT NULL DEFAULT 1,
    earned_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE(user_id, badge_type)
);

-- Enable RLS
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_badges
CREATE POLICY "Anyone can view badges" 
ON public.user_badges 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can manage badges" 
ON public.user_badges 
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Function to calculate and update user badges based on comment count
CREATE OR REPLACE FUNCTION public.update_user_comment_badge()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    comment_count integer;
    badge_level integer;
BEGIN
    -- Count comments for the user
    SELECT COUNT(*) INTO comment_count
    FROM public.comments
    WHERE user_id = NEW.user_id;
    
    -- Determine badge level
    IF comment_count >= 100 THEN
        badge_level := 5; -- Gold Star
    ELSIF comment_count >= 50 THEN
        badge_level := 4; -- Purple Star
    ELSIF comment_count >= 25 THEN
        badge_level := 3; -- Blue Star
    ELSIF comment_count >= 10 THEN
        badge_level := 2; -- Green Star
    ELSIF comment_count >= 5 THEN
        badge_level := 1; -- Bronze Star
    ELSE
        badge_level := 0; -- No badge
    END IF;
    
    -- Insert or update badge if level > 0
    IF badge_level > 0 AND NEW.user_id IS NOT NULL THEN
        INSERT INTO public.user_badges (user_id, badge_type, badge_level)
        VALUES (NEW.user_id, 'commenter', badge_level)
        ON CONFLICT (user_id, badge_type) 
        DO UPDATE SET badge_level = badge_level, earned_at = now()
        WHERE user_badges.badge_level < badge_level;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Trigger for updating badges when a comment is added
DROP TRIGGER IF EXISTS update_comment_badge_trigger ON public.comments;
CREATE TRIGGER update_comment_badge_trigger
AFTER INSERT ON public.comments
FOR EACH ROW
EXECUTE FUNCTION public.update_user_comment_badge();