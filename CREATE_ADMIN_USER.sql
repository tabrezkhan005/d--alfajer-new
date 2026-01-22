-- Admin User Creation Script
-- Run this in Supabase SQL Editor after creating the user via Dashboard

-- Step 1: First, create the user via Supabase Dashboard:
-- 1. Go to Authentication → Users → Add User → Create new user
-- 2. Email: admin@alfajer.com
-- 3. Password: (set a strong password)
-- 4. Click "Create User"

-- Step 2: After creating the user, run this SQL to set admin role
-- Replace 'admin@alfajer.com' with the actual email you used

UPDATE auth.users
SET 
  raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || 
  jsonb_build_object(
    'role', 'admin',
    'isAdmin', true,
    'name', 'Admin User'
  )
WHERE email = 'admin@alfajer.com';

-- Verify the update
SELECT 
  id,
  email,
  raw_user_meta_data->>'role' as role,
  raw_user_meta_data->>'isAdmin' as is_admin,
  raw_user_meta_data->>'name' as name
FROM auth.users
WHERE email = 'admin@alfajer.com';
