-- Create public_profiles table in Supabase
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