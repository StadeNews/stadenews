-- Allow users to view their own stories regardless of status
CREATE POLICY "Users can view their own stories"
ON public.stories
FOR SELECT
USING (user_id = auth.uid());