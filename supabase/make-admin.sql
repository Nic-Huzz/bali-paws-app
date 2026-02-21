-- Run this in Supabase SQL Editor AFTER Ken signs up through the app.
-- This promotes his account to admin so he can manage dogs and post updates.

UPDATE public.profiles
SET role = 'admin'
WHERE email = 'keninbali@yahoo.com';
