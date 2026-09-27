-- Add display_email column to profiles table
-- Run this in your Supabase SQL editor

-- Check if display_email column exists and add it if it doesn't
DO $$ 
BEGIN
    -- Add display_email column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'display_email') THEN
        ALTER TABLE profiles ADD COLUMN display_email TEXT;
    END IF;
    
END $$;

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name = 'display_email'; 