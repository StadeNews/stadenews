-- Add triggers for story and like badges
-- Trigger function for story badges
CREATE OR REPLACE FUNCTION public.update_user_story_badge()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    story_count integer;
    badge_level integer;
BEGIN
    -- Only count published stories
    IF NEW.status != 'published' THEN
        RETURN NEW;
    END IF;
    
    -- Count published stories for the user
    SELECT COUNT(*) INTO story_count
    FROM public.stories
    WHERE user_id = NEW.user_id AND status = 'published';
    
    -- Determine badge level
    IF story_count >= 50 THEN
        badge_level := 5;
    ELSIF story_count >= 25 THEN
        badge_level := 4;
    ELSIF story_count >= 10 THEN
        badge_level := 3;
    ELSIF story_count >= 5 THEN
        badge_level := 2;
    ELSIF story_count >= 1 THEN
        badge_level := 1;
    ELSE
        badge_level := 0;
    END IF;
    
    -- Insert or update badge if level > 0
    IF badge_level > 0 AND NEW.user_id IS NOT NULL THEN
        INSERT INTO public.user_badges (user_id, badge_type, badge_level)
        VALUES (NEW.user_id, 'storyteller', badge_level)
        ON CONFLICT (user_id, badge_type) 
        DO UPDATE SET badge_level = EXCLUDED.badge_level, earned_at = now()
        WHERE user_badges.badge_level < EXCLUDED.badge_level;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Trigger for story badges
DROP TRIGGER IF EXISTS update_story_badge_trigger ON public.stories;
CREATE TRIGGER update_story_badge_trigger
AFTER INSERT OR UPDATE OF status ON public.stories
FOR EACH ROW
EXECUTE FUNCTION public.update_user_story_badge();

-- Trigger function for likes received badges (on profile)
CREATE OR REPLACE FUNCTION public.update_user_liked_badge()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    total_likes integer;
    badge_level integer;
    story_owner_id uuid;
BEGIN
    -- Get the story owner
    SELECT user_id INTO story_owner_id
    FROM public.stories
    WHERE id = NEW.story_id;
    
    IF story_owner_id IS NULL THEN
        RETURN NEW;
    END IF;
    
    -- Count total likes on all stories by this user
    SELECT COALESCE(SUM(likes_count), 0) INTO total_likes
    FROM public.stories
    WHERE user_id = story_owner_id;
    
    -- Determine badge level
    IF total_likes >= 500 THEN
        badge_level := 5;
    ELSIF total_likes >= 200 THEN
        badge_level := 4;
    ELSIF total_likes >= 100 THEN
        badge_level := 3;
    ELSIF total_likes >= 50 THEN
        badge_level := 2;
    ELSIF total_likes >= 10 THEN
        badge_level := 1;
    ELSE
        badge_level := 0;
    END IF;
    
    -- Insert or update badge
    IF badge_level > 0 THEN
        INSERT INTO public.user_badges (user_id, badge_type, badge_level)
        VALUES (story_owner_id, 'popular', badge_level)
        ON CONFLICT (user_id, badge_type) 
        DO UPDATE SET badge_level = EXCLUDED.badge_level, earned_at = now()
        WHERE user_badges.badge_level < EXCLUDED.badge_level;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Trigger for likes received
DROP TRIGGER IF EXISTS update_liked_badge_trigger ON public.likes;
CREATE TRIGGER update_liked_badge_trigger
AFTER INSERT ON public.likes
FOR EACH ROW
EXECUTE FUNCTION public.update_user_liked_badge();