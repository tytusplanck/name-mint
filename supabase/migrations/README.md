# Database Migrations

This directory contains the database migrations for the Nametica application. The migrations must be run in the specified order to ensure proper database setup.

## Migration Order

1. `20240324_001_create_profiles.sql`

   - Creates the profiles table
   - Establishes RLS policies for user profile access
   - Required before credits table (referenced in user creation trigger)

2. `20240324_002_create_credits.sql`

   - Creates the credits table with foreign key to profiles
   - Sets up RLS policies for credits
   - Creates the new user trigger that handles both profile and credits creation
   - Dependencies: Requires profiles table

3. `20240324_003_enable_realtime.sql`

   - Enables real-time updates for the credits table
   - Dependencies: Requires credits table

4. `20240324_004_update_initial_credits.sql`

   - Updates existing users with low credits to have 10 credits
   - Updates the new user trigger to give 10 initial credits
   - Dependencies: Requires credits table and handle_new_user function

5. `20240324_005_create_decrement_credits.sql`

   - Creates the function to safely decrement user credits
   - Dependencies: Requires credits table

6. `20240324_006_create_increment_credits.sql`
   - Creates the function to increment user credits (used by payment system)
   - Dependencies: Requires credits table

## Important Notes

- All migrations use IF EXISTS/IF NOT EXISTS to be idempotent
- Each migration is wrapped in a transaction for atomicity
- RLS policies ensure data security
- The order is critical due to foreign key constraints and function dependencies

## Verification

After running migrations, verify:

1. New user signup creates both profile and credits
2. Credits start at 10 for new users
3. Real-time updates work for credit changes
4. Credit increment/decrement functions work as expected
