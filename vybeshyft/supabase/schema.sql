-- Schema for VibeShift app

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS "Users" (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  bio TEXT,
  profile_picture TEXT,
  recovery_milestone TEXT
);

-- Posts table
CREATE TABLE IF NOT EXISTS "Posts" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES "Users"(id) NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comments table
CREATE TABLE IF NOT EXISTS "Comments" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES "Posts"(id) NOT NULL,
  user_id UUID REFERENCES "Users"(id) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Likes table
CREATE TABLE IF NOT EXISTS "Likes" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES "Posts"(id) NOT NULL,
  user_id UUID REFERENCES "Users"(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE "Users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Posts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Comments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Likes" ENABLE ROW LEVEL SECURITY;

-- Policies for Users table
CREATE POLICY "Users can view all profiles" ON "Users"
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON "Users"
  FOR UPDATE USING (auth.uid() = id);

-- Policies for Posts table
CREATE POLICY "Anyone can view posts" ON "Posts"
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create posts" ON "Posts"
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts" ON "Posts"
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts" ON "Posts"
  FOR DELETE USING (auth.uid() = user_id);

-- Policies for Comments table
CREATE POLICY "Anyone can view comments" ON "Comments"
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create comments" ON "Comments"
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" ON "Comments"
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON "Comments"
  FOR DELETE USING (auth.uid() = user_id);

-- Policies for Likes table
CREATE POLICY "Anyone can view likes" ON "Likes"
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create likes" ON "Likes"
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes" ON "Likes"
  FOR DELETE USING (auth.uid() = user_id); 