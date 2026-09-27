-- Add social link columns to profiles table if they don't exist
-- Run this in your Supabase SQL editor

-- Check if columns exist and add them if they don't
DO $$ 
BEGIN
    -- Add facebook_url column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'facebook_url') THEN
        ALTER TABLE profiles ADD COLUMN facebook_url TEXT;
    END IF;
    
    -- Add instagram_url column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'instagram_url') THEN
        ALTER TABLE profiles ADD COLUMN instagram_url TEXT;
    END IF;
    
    -- Add twitter_url column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'twitter_url') THEN
        ALTER TABLE profiles ADD COLUMN twitter_url TEXT;
    END IF;
    
    -- Add github_url column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'github_url') THEN
        ALTER TABLE profiles ADD COLUMN github_url TEXT;
    END IF;
    
    -- Add reflectly_url column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'reflectly_url') THEN
        ALTER TABLE profiles ADD COLUMN reflectly_url TEXT;
    END IF;
    
END $$;

-- Verify the columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('facebook_url', 'instagram_url', 'twitter_url', 'github_url', 'reflectly_url')
ORDER BY column_name; 