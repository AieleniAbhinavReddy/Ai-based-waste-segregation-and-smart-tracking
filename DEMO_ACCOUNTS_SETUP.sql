-- =====================================================
-- DEMO ACCOUNTS SETUP SCRIPT
-- For Green India Smart Waste Management System
-- =====================================================
-- This script creates 3 demo accounts: Admin, Supervisor, and Citizen
-- Run this in Supabase SQL Editor to set up demo accounts

-- =====================================================
-- STEP 1: Create Admin Demo Account
-- =====================================================
-- First, create the user in Supabase Auth
-- IMPORTANT: You must do this step FIRST via Supabase UI

-- After user is created in Auth, insert profile:
INSERT INTO public.user_profiles (id, email, full_name, bio, avatar_url, points, created_at, updated_at)
SELECT 
  id,
  email,
  'Admin User' as full_name,
  'Demo Admin Account' as bio,
  NULL as avatar_url,
  1000 as points,
  NOW() as created_at,
  NOW() as updated_at
FROM auth.users
WHERE email = 'admin@greenidia.com'
ON CONFLICT (id) DO UPDATE SET 
  full_name = 'Admin User',
  bio = 'Demo Admin Account',
  points = 1000,
  updated_at = NOW();

-- Assign admin role
INSERT INTO public.user_roles (user_id, role, status)
SELECT id, 'admin', 'active'
FROM auth.users
WHERE email = 'admin@greenidia.com'
ON CONFLICT (user_id) DO UPDATE 
SET role = 'admin', status = 'active';

-- =====================================================
-- STEP 2: Create Supervisor Demo Account
-- =====================================================
-- First, create the user in Supabase Auth
-- IMPORTANT: You must do this step FIRST via Supabase UI

-- After user is created in Auth, insert profile:
INSERT INTO public.user_profiles (id, email, full_name, bio, avatar_url, points, created_at, updated_at)
SELECT 
  id,
  email,
  'Supervisor User' as full_name,
  'Demo Supervisor Account' as bio,
  NULL as avatar_url,
  500 as points,
  NOW() as created_at,
  NOW() as updated_at
FROM auth.users
WHERE email = 'supervisor@greenidia.com'
ON CONFLICT (id) DO UPDATE SET 
  full_name = 'Supervisor User',
  bio = 'Demo Supervisor Account',
  points = 500,
  updated_at = NOW();

-- Assign supervisor role
INSERT INTO public.user_roles (user_id, role, status)
SELECT id, 'supervisor', 'active'
FROM auth.users
WHERE email = 'supervisor@greenidia.com'
ON CONFLICT (user_id) DO UPDATE 
SET role = 'supervisor', status = 'active';

-- Create supervisor profile with zone assignment
-- First create a demo zone if it doesn't exist
INSERT INTO public.zones (name, code, city, population, area_sqkm, status)
VALUES ('Demo Zone 1', 'DZ001', 'Demo City', 50000, 25.5, 'active')
ON CONFLICT (name) DO NOTHING;

-- Add supervisor record
INSERT INTO public.supervisors (user_id, zone_id, supervisor_code, phone, department, status)
SELECT 
  u.id,
  z.id,
  'SUP001' as supervisor_code,
  '+919876543210' as phone,
  'Waste Management' as department,
  'active' as status
FROM auth.users u, public.zones z
WHERE u.email = 'supervisor@greenidia.com'
  AND z.code = 'DZ001'
ON CONFLICT (user_id) DO UPDATE
SET zone_id = (SELECT id FROM public.zones WHERE code = 'DZ001'),
    phone = '+919876543210',
    status = 'active';

-- Update zones table to assign supervisor
UPDATE public.zones 
SET supervisor_id = (SELECT id FROM auth.users WHERE email = 'supervisor@greenidia.com')
WHERE code = 'DZ001';

-- =====================================================
-- STEP 3: Create Citizen Demo Account
-- =====================================================
-- First, create the user in Supabase Auth
-- IMPORTANT: You must do this step FIRST via Supabase UI

-- After user is created in Auth, insert profile:
INSERT INTO public.user_profiles (id, email, full_name, bio, avatar_url, points, created_at, updated_at)
SELECT 
  id,
  email,
  'Citizen User' as full_name,
  'Demo Citizen Account' as bio,
  NULL as avatar_url,
  250 as points,
  NOW() as created_at,
  NOW() as updated_at
FROM auth.users
WHERE email = 'citizen@greenidia.com'
ON CONFLICT (id) DO UPDATE SET 
  full_name = 'Citizen User',
  bio = 'Demo Citizen Account',
  points = 250,
  updated_at = NOW();

-- Assign citizen role
INSERT INTO public.user_roles (user_id, role, status)
SELECT id, 'citizen', 'active'
FROM auth.users
WHERE email = 'citizen@greenidia.com'
ON CONFLICT (user_id) DO UPDATE 
SET role = 'citizen', status = 'active';

-- Create citizen compliance record
INSERT INTO public.citizen_compliance (citizen_id, zone_id, compliance_score, total_waste_generated_kg)
SELECT 
  u.id,
  z.id,
  85 as compliance_score,
  250 as total_waste_generated_kg
FROM auth.users u, public.zones z
WHERE u.email = 'citizen@greenidia.com'
  AND z.code = 'DZ001'
ON CONFLICT (citizen_id) DO UPDATE
SET compliance_score = 85,
    total_waste_generated_kg = 250;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these to verify the setup:

-- Check if demo accounts exist in auth
SELECT email, created_at FROM auth.users WHERE email LIKE '%greenidia.com%';

-- Check user_profiles
SELECT id, email, full_name FROM public.user_profiles WHERE email LIKE '%greenidia.com%';

-- Check user_roles
SELECT ur.id, up.email, ur.role, ur.status 
FROM public.user_roles ur
JOIN public.user_profiles up ON ur.user_id = up.id
WHERE up.email LIKE '%greenidia.com%';

-- Check supervisor assignment
SELECT s.supervisor_code, u.email, z.name, s.status
FROM public.supervisors s
JOIN auth.users u ON s.user_id = u.id
JOIN public.zones z ON s.zone_id = z.id
WHERE u.email = 'supervisor@greenidia.com';

-- Check citizen compliance
SELECT u.email, cc.compliance_score, z.name
FROM public.citizen_compliance cc
JOIN auth.users u ON cc.citizen_id = u.id
JOIN public.zones z ON cc.zone_id = z.id
WHERE u.email = 'citizen@greenidia.com';

-- =====================================================
-- TROUBLESHOOTING SECTION
-- =====================================================

-- If you get errors about auth.users not existing,
-- it means the accounts weren't created in Supabase Auth yet.
-- You MUST manually create them in Supabase first:
-- 1. Go to https://app.supabase.com
-- 2. Select your project
-- 3. Go to Authentication → Users
-- 4. Click "Invite" or create new user
-- 5. Add email: admin@greenidia.com with password: Admin@123456
-- 6. Add email: supervisor@greenidia.com with password: Supervisor@123456
-- 7. Add email: citizen@greenidia.com with password: Citizen@123456
-- 8. THEN run this entire script

-- If zone creation fails with "Demo Zone 1 already exists",
-- that's OK - it just means the zone already exists. Continue.

-- If you still get errors, check:
-- 1. Are the auth users created in Supabase? (Check Auth → Users tab)
-- 2. Are RLS policies enabled? (Check Authentication → Policies)
-- 3. Do you have correct Supabase permissions?
