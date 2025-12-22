-- Insert admin role for Stade.news@web.de user
-- Note: This will be executed after the user registers

-- First, ensure the user_roles table has proper structure (if not exists)
DO $$
BEGIN
  -- Check if the user exists and add admin role
  -- This is designed to work with the email once registered
  INSERT INTO public.user_roles (user_id, role)
  SELECT id, 'admin'::app_role
  FROM auth.users
  WHERE email = 'Stade.news@web.de'
  ON CONFLICT (user_id, role) DO NOTHING;
END $$;