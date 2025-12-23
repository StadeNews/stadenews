-- Create function to make a user admin
CREATE OR REPLACE FUNCTION public.admin_make_admin(_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if the calling user is an admin
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;
  
  -- Check if user already has admin role
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'admin') THEN
    RETURN true; -- Already admin
  END IF;
  
  -- Insert admin role for the user
  INSERT INTO public.user_roles (user_id, role)
  VALUES (_user_id, 'admin'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN true;
END;
$$;

-- Create function to remove admin role
CREATE OR REPLACE FUNCTION public.admin_remove_admin(_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if the calling user is an admin
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;
  
  -- Prevent removing yourself as admin
  IF _user_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot remove admin role from yourself';
  END IF;
  
  -- Delete admin role for the user
  DELETE FROM public.user_roles WHERE user_id = _user_id AND role = 'admin';
  
  RETURN true;
END;
$$;