-- Function to safely decrement credits
CREATE OR REPLACE FUNCTION public.decrement_credits()
RETURNS void AS $$
BEGIN
  UPDATE public.credits
  SET 
    credits_remaining = GREATEST(credits_remaining - 1, 0),
    updated_at = timezone('utc'::text, now())
  WHERE user_id = auth.uid()
  AND credits_remaining > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 