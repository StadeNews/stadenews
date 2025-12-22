-- Create private responses table for Spotted posts
CREATE TABLE public.spotted_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  spotted_id UUID NOT NULL REFERENCES public.spotted(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  anonymous_author TEXT,
  message TEXT NOT NULL,
  contact_info TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_read BOOLEAN DEFAULT false
);

-- Enable RLS
ALTER TABLE public.spotted_responses ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a private response
CREATE POLICY "Anyone can submit spotted responses" 
ON public.spotted_responses 
FOR INSERT 
WITH CHECK (true);

-- Spotted post author can view responses
CREATE POLICY "Spotted authors can view their responses" 
ON public.spotted_responses 
FOR SELECT 
USING (
  spotted_id IN (
    SELECT id FROM public.spotted 
    WHERE user_id = auth.uid() 
    OR anonymous_author IS NOT NULL
  )
);

-- Admins can view all responses
CREATE POLICY "Admins can view all spotted responses" 
ON public.spotted_responses 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete group messages
CREATE POLICY "Admins can delete group messages" 
ON public.group_messages 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));