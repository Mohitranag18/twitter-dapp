-- Create public_profiles-- Create followers table for tracking follow relationships
CREATE TABLE IF NOT EXISTS followers (
  id SERIAL PRIMARY KEY,
  follower_address VARCHAR(42) NOT NULL, -- User who is following
  following_address VARCHAR(42) NOT NULL, -- User being followed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(follower_address, following_address) -- Prevent duplicate follows
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_followers_follower ON followers(follower_address);
CREATE INDEX IF NOT EXISTS idx_followers_following ON followers(following_address);

-- Enable Row Level Security (RLS)
ALTER TABLE followers ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Followers relationships are viewable by everyone" ON followers
  FOR SELECT USING (true);

-- Create policy for users to manage their own following relationships
CREATE POLICY "Users can insert their own follow relationships" ON followers
  FOR INSERT WITH CHECK (follower_address = current_setting('request.jwt.claims', true)::json->>'address');

CREATE POLICY "Users can delete their own follow relationships" ON followers
  FOR DELETE USING (follower_address = current_setting('request.jwt.claims', true)::json->>'address');ble in Supabase
-- Run this SQL in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public_profiles (
  id SERIAL PRIMARY KEY,
  address VARCHAR(42) UNIQUE NOT NULL, -- Ethereum address (42 chars with 0x)
  display_name VARCHAR(255) NOT NULL,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on address for faster lookups
CREATE INDEX IF NOT EXISTS idx_public_profiles_address ON public_profiles(address);

-- Enable Row Level Security (RLS)
ALTER TABLE public_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Public profiles are viewable by everyone" ON public_profiles
  FOR SELECT USING (true);

-- Create policy for authenticated users to insert their own profile
CREATE POLICY "Users can insert their own public profile" ON public_profiles
  FOR INSERT WITH CHECK (true);

-- Create policy for users to update their own profile
CREATE POLICY "Users can update their own public profile" ON public_profiles
  FOR UPDATE USING (address = current_setting('request.jwt.claims', true)::json->>'address');