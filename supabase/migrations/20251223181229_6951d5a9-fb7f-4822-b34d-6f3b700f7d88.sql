-- Drop the insecure view that exposes auth.users
DROP VIEW IF EXISTS public.admin_user_overview;

-- Instead, we'll fetch profiles directly and use RPC function for admin to get user details
CREATE OR REPLACE FUNCTION public.get_admin_users()
RETURNS TABLE (
  id uuid,
  username text,
  avatar_url text,
  bio text,
  is_private boolean,
  is_online boolean,
  created_at timestamptz,
  updated_at timestamptz,
  role text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.id,
    p.username,
    p.avatar_url,
    p.bio,
    p.is_private,
    p.is_online,
    p.created_at,
    p.updated_at,
    COALESCE(ur.role::text, 'user') as role
  FROM public.profiles p
  LEFT JOIN public.user_roles ur ON p.id = ur.user_id
  WHERE has_role(auth.uid(), 'admin');
$$;