-- Fix RLS policies for chat_groups - change from RESTRICTIVE to PERMISSIVE
DROP POLICY IF EXISTS "Anyone can view active chat groups" ON public.chat_groups;

CREATE POLICY "Anyone can view active chat groups" 
ON public.chat_groups 
FOR SELECT 
TO public
USING (is_active = true);

-- Create updates table for news/announcements
CREATE TABLE IF NOT EXISTS public.updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  update_type TEXT NOT NULL DEFAULT 'general', -- 'tiktok', 'instagram', 'facebook', 'general'
  external_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT true
);

-- Enable RLS
ALTER TABLE public.updates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for updates
CREATE POLICY "Anyone can view active updates"
ON public.updates
FOR SELECT
TO public
USING (is_active = true);

CREATE POLICY "Admins can manage updates"
ON public.updates
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));