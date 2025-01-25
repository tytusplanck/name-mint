-- Drop existing objects if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create credits table
CREATE TABLE IF NOT EXISTS public.credits (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL UNIQUE,
  credits_remaining integer DEFAULT 0 NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.credits ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own credits" ON credits;
DROP POLICY IF EXISTS "Service role can manage credits" ON credits;

-- Users can only read their own credits
CREATE POLICY "Users can view own credits" 
  ON credits FOR SELECT 
  USING (auth.uid() = user_id);

-- Only service role can insert/update credits
CREATE POLICY "Service role can manage credits" 
  ON credits FOR ALL 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

-- Function to create both profile and credits on user signup
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

-- Trigger to create profile and credits on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user(); 