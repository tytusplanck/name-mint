-- Update existing users with less than 3 credits to have 10 credits
UPDATE credits 
SET credits_remaining = 10 
WHERE credits_remaining <= 3;

-- Update the handle_new_user function to give 10 credits
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id)
  VALUES (new.id);
  
  -- Create credits with initial amount
  INSERT INTO public.credits (user_id, credits_remaining)
  VALUES (new.id, 10);
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 