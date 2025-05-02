-- Functions for creating tables that don't exist

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Users table if it doesn't exist
CREATE TABLE IF NOT EXISTS "Users" (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  bio TEXT,
  profile_picture TEXT,
  recovery_milestone TEXT
);

-- Enable Row Level Security
ALTER TABLE "Users" ENABLE ROW LEVEL SECURITY;

-- Policies for Users table
DROP POLICY IF EXISTS "Users can view all profiles" ON "Users";
CREATE POLICY "Users can view all profiles" ON "Users"
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON "Users";
CREATE POLICY "Users can update their own profile" ON "Users"
  FOR UPDATE USING (auth.uid() = id);
  
DROP POLICY IF EXISTS "Users can insert their own profile" ON "Users";
CREATE POLICY "Users can insert their own profile" ON "Users"
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create Posts table if it doesn't exist
CREATE TABLE IF NOT EXISTS "Posts" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE "Posts" ENABLE ROW LEVEL SECURITY;

-- Policies for Posts table
DROP POLICY IF EXISTS "Anyone can view posts" ON "Posts";
CREATE POLICY "Anyone can view posts" ON "Posts"
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create posts" ON "Posts";
CREATE POLICY "Authenticated users can create posts" ON "Posts"
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own posts" ON "Posts";
CREATE POLICY "Users can update their own posts" ON "Posts"
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own posts" ON "Posts";
CREATE POLICY "Users can delete their own posts" ON "Posts"
  FOR DELETE USING (auth.uid() = user_id);

-- Create Comments table if it doesn't exist
CREATE TABLE IF NOT EXISTS "Comments" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE "Comments" ENABLE ROW LEVEL SECURITY;

-- Policies for Comments table
DROP POLICY IF EXISTS "Anyone can view comments" ON "Comments";
CREATE POLICY "Anyone can view comments" ON "Comments"
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create comments" ON "Comments";
CREATE POLICY "Authenticated users can create comments" ON "Comments"
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own comments" ON "Comments";
CREATE POLICY "Users can update their own comments" ON "Comments"
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own comments" ON "Comments";
CREATE POLICY "Users can delete their own comments" ON "Comments"
  FOR DELETE USING (auth.uid() = user_id);

-- Create Likes table if it doesn't exist
CREATE TABLE IF NOT EXISTS "Likes" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE "Likes" ENABLE ROW LEVEL SECURITY;

-- Policies for Likes table
DROP POLICY IF EXISTS "Anyone can view likes" ON "Likes";
CREATE POLICY "Anyone can view likes" ON "Likes"
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create likes" ON "Likes";
CREATE POLICY "Authenticated users can create likes" ON "Likes"
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own likes" ON "Likes";
CREATE POLICY "Users can delete their own likes" ON "Likes"
  FOR DELETE USING (auth.uid() = user_id); 