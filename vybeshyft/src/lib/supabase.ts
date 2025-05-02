import { createClient } from '@supabase/supabase-js';
import { ENV } from '../env.template';

// Use the environment variables (with fallbacks from env.template.ts)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ENV.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ENV.SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Initialize database by checking tables
export const initDatabase = async () => {
  try {
    console.log('Checking database tables...');
    
    // We'll simply check if tables exist and inform the user
    // The actual table creation should be done in the Supabase SQL Editor
    
    // Check if Users table exists
    const { error: usersError } = await supabase
      .from('Users')
      .select('id')
      .limit(1);
      
    if (usersError) {
      console.warn('Users table does not exist. Please run the SQL setup script in Supabase Management Console Panel.');
    } else {
      console.log('Users table exists.');
    }
    
    // Check if Posts table exists
    const { error: postsError } = await supabase
      .from('Posts')
      .select('id')
      .limit(1);
      
    if (postsError) {
      console.warn('Posts table does not exist. Please run the SQL setup script in Supabase Management Console Panel.');
    } else {
      console.log('Posts table exists.');
    }
    
    // Check if Comments table exists
    const { error: commentsError } = await supabase
      .from('Comments')
      .select('id')
      .limit(1);
      
    if (commentsError) {
      console.warn('Comments table does not exist. Please run the SQL setup script in Supabase Management Console Panel.');
    } else {
      console.log('Comments table exists.');
    }
    
    // Check if Likes table exists
    const { error: likesError } = await supabase
      .from('Likes')
      .select('id')
      .limit(1);
      
    if (likesError) {
      console.warn('Likes table does not exist. Please run the SQL setup script in Supabase Management Console Panel.');
    } else {
      console.log('Likes table exists.');
    }
    
    // Check if SOS_Requests table exists
    const { error: sosRequestsError } = await supabase
      .from('SOS_Requests')
      .select('id')
      .limit(1);
      
    if (sosRequestsError) {
      console.warn('SOS_Requests table does not exist. Please run the SQL setup script in Supabase Management Console Panel.');
    } else {
      console.log('SOS_Requests table exists.');
    }
    
    console.log('Database check complete.');
  } catch (error) {
    console.error('Error checking database tables:', error);
  }
};

// Database types based on our schema
export type User = {
  id: string;
  email: string;
  name: string;
  bio: string | null;
  profile_picture: string | null;
  recovery_milestone: string | null;
  password?: string; // Only for the simple auth mode
};

export type Post = {
  id: string;
  user_id: string;
  content: string;
  image_url: string | null;
  created_at: string;
  // For display
  user_name?: string;
  user_profile_picture?: string;
  likes_count?: number;
  comments_count?: number;
  has_liked?: boolean;
};

export type Comment = {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  // For display
  user_name?: string;
  user_profile_picture?: string;
};

export type Like = {
  id: string;
  post_id: string;
  user_id: string;
};

// Add SOS_Request type
export type SOSRequest = {
  id: string;
  user_id: string;
  status: 'active' | 'resolved' | 'cancelled';
  location: string | null;
  description: string;
  created_at: string;
};

// Add types for blocked users
export interface BlockedUser {
  id: string;
  user_id: string;
  blocked_user_id: string;
  created_at: string;
}

// Function to block a user
export const blockUser = async (blockedUserId: string) => {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return { error: new Error('User not authenticated') };

  try {
    const { data, error } = await supabase
      .from('BlockedUsers')
      .insert([{
        user_id: userData.user.id,
        blocked_user_id: blockedUserId,
      }])
      .select();

    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error blocking user:', error);
    return { data: null, error };
  }
};

// Function to unblock a user
export const unblockUser = async (blockedUserId: string) => {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return { error: new Error('User not authenticated') };

  try {
    const { data, error } = await supabase
      .from('BlockedUsers')
      .delete()
      .match({
        user_id: userData.user.id,
        blocked_user_id: blockedUserId,
      })
      .select();

    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error unblocking user:', error);
    return { data: null, error };
  }
};

// Function to get all blocked users
export const getBlockedUsers = async () => {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return { data: null, error: new Error('User not authenticated') };

  try {
    const { data, error } = await supabase
      .from('BlockedUsers')
      .select('*, blocked_user:blocked_user_id(id, name, profile_picture)')
      .eq('user_id', userData.user.id);

    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching blocked users:', error);
    return { data: null, error };
  }
};

// Function to check if a user is blocked
export const isUserBlocked = async (userId: string) => {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return false;

  try {
    const { data, error } = await supabase
      .from('BlockedUsers')
      .select('id')
      .eq('user_id', userData.user.id)
      .eq('blocked_user_id', userId)
      .maybeSingle();

    if (error) throw error;
    
    return data !== null;
  } catch (error) {
    console.error('Error checking if user is blocked:', error);
    return false;
  }
}; 