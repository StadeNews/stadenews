-- Chat groups table for user-created public chat groups
CREATE TABLE public.chat_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  creator_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  is_active boolean DEFAULT true
);

-- Enable RLS
ALTER TABLE public.chat_groups ENABLE ROW LEVEL SECURITY;

-- Everyone can view active chat groups
CREATE POLICY "Anyone can view active chat groups" ON public.chat_groups
FOR SELECT USING (is_active = true);

-- Authenticated users can create chat groups
CREATE POLICY "Authenticated users can create chat groups" ON public.chat_groups
FOR INSERT TO authenticated WITH CHECK (auth.uid() = creator_id);

-- Creators and admins can update their groups
CREATE POLICY "Creators can update their groups" ON public.chat_groups
FOR UPDATE USING (auth.uid() = creator_id OR has_role(auth.uid(), 'admin'));

-- Admins can delete groups
CREATE POLICY "Admins can delete chat groups" ON public.chat_groups
FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- Group messages table
CREATE TABLE public.group_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES public.chat_groups(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  nickname text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  is_anonymous boolean DEFAULT true,
  is_deleted boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.group_messages ENABLE ROW LEVEL SECURITY;

-- Everyone can view non-deleted group messages
CREATE POLICY "Anyone can view group messages" ON public.group_messages
FOR SELECT USING (is_deleted = false);

-- Anyone can send group messages
CREATE POLICY "Anyone can send group messages" ON public.group_messages
FOR INSERT WITH CHECK (true);

-- Admins can update (delete) messages
CREATE POLICY "Admins can update group messages" ON public.group_messages
FOR UPDATE USING (has_role(auth.uid(), 'admin'));

-- Enable realtime for chat groups
ALTER PUBLICATION supabase_realtime ADD TABLE public.group_messages;