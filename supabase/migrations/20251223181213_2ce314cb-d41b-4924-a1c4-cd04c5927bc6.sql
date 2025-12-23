-- Add is_private column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_private boolean DEFAULT false;

-- Update the RLS policy to hide private profiles from public (except for the owner and admins)
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

CREATE POLICY "Public profiles viewable by everyone" 
ON public.profiles 
FOR SELECT 
USING (
  (is_private = false) 
  OR (auth.uid() = id) 
  OR has_role(auth.uid(), 'admin')
);

-- Create view to get all profiles for admin with online status
CREATE OR REPLACE VIEW public.admin_user_overview AS
SELECT 
  p.id,
  p.username,
  p.avatar_url,
  p.bio,
  p.is_private,
  p.is_online,
  p.created_at,
  p.updated_at,
  au.email,
  au.created_at as account_created,
  au.last_sign_in_at,
  COALESCE(ur.role, 'user') as role
FROM public.profiles p
LEFT JOIN auth.users au ON p.id = au.id
LEFT JOIN public.user_roles ur ON p.id = ur.user_id;