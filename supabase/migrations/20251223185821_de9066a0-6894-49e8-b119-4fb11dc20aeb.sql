-- Create a function that allows admins to delete user accounts
-- This deletes the user from auth.users which cascades to profiles due to the FK
CREATE OR REPLACE FUNCTION public.admin_delete_user(_user_id uuid)
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
  
  -- Delete the user from auth.users (this cascades to profiles and other related tables)
  DELETE FROM auth.users WHERE id = _user_id;
  
  RETURN true;
END;
$$;

-- Grant execute permission to authenticated users (the function itself checks for admin role)
GRANT EXECUTE ON FUNCTION public.admin_delete_user(uuid) TO authenticated;