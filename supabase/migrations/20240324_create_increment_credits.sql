create or replace function increment_credits(p_user_id uuid, p_credits integer)
returns void
language plpgsql
security definer
as $$
begin
  insert into credits (user_id, credits_remaining)
  values (p_user_id, p_credits)
  on conflict (user_id)
  do update set credits_remaining = credits.credits_remaining + p_credits;
end;
$$; 