import { supabase, User } from './supabase';
import { ENV } from '../env.template';

// Simple mock of the Clerk interface for easy transition later
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  imageUrl?: string;
}

// Auth state listeners
const listeners: ((user: AuthUser | null) => void)[] = [];

// Current user
let currentUser: AuthUser | null = null;

// Initialize auth
export const initAuth = async () => {
  const session = await supabase.auth.getSession();
  if (session.data.session) {
    // Get the user profile from our Users table
    const { data } = await supabase
      .from('Users')
      .select('*')
      .eq('id', session.data.session.user.id)
      .single();
    
    if (data) {
      currentUser = {
        id: data.id,
        email: data.email,
        name: data.name,
        imageUrl: data.profile_picture,
      };
      
      // Notify listeners
      listeners.forEach(listener => listener(currentUser));
    }
  }

  // Set up auth state change listener
  supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' && session) {
      // Get user profile
      const { data } = await supabase
        .from('Users')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (data) {
        currentUser = {
          id: data.id,
          email: data.email,
          name: data.name,
          imageUrl: data.profile_picture,
        };
      } else {
        // User doesn't exist in our Users table yet, create a profile
        try {
          const { data: newUserData, error: insertError } = await supabase
            .from('Users')
            .insert([{
              id: session.user.id,
              email: session.user.email || 'user@example.com',
              name: session.user.user_metadata?.name || 'User',
              bio: null,
              profile_picture: null,
              recovery_milestone: null,
            }])
            .select();
            
          if (!insertError && newUserData && newUserData[0]) {
            currentUser = {
              id: newUserData[0].id,
              email: newUserData[0].email,
              name: newUserData[0].name,
              imageUrl: newUserData[0].profile_picture,
            };
          }
        } catch (err) {
          console.error('Error creating user profile on sign-in:', err);
        }
      }
    } else if (event === 'SIGNED_OUT') {
      currentUser = null;
    }

    // Notify listeners
    listeners.forEach(listener => listener(currentUser));
  });
};

// Register a new user
export const registerUser = async (email: string, password: string, name: string): Promise<{ user: AuthUser | null, error: string | null }> => {
  try {
    // Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name // Store the name in user metadata
        }
      }
    });

    if (authError) throw authError;
    
    if (!authData.user) {
      return { user: null, error: 'Failed to create user' };
    }

    // Important: We don't need to insert into the Users table here
    // The onAuthStateChange event will handle that when the user is confirmed
    // This avoids RLS policy issues when trying to insert before authentication is complete

    const newUser: AuthUser = {
      id: authData.user.id,
      email: authData.user.email || email,
      name: name,
    };

    return { 
      user: newUser, 
      error: authData.session ? null : 'Account created! Please check your email for confirmation.'
    };
    
  } catch (error) {
    console.error('Registration error:', error);
    return { 
      user: null, 
      error: error instanceof Error ? error.message : 'An unknown error occurred during registration' 
    };
  }
};

// Sign in a user
export const signInUser = async (email: string, password: string): Promise<{ user: AuthUser | null, error: string | null }> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    if (!data.user) {
      return { user: null, error: 'No user returned from sign-in' };
    }

    // Get the user profile
    const { data: userData, error: userError } = await supabase
      .from('Users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (userError) {
      // User doesn't exist in our Users table yet, create a profile
      try {
        const { data: newUserData, error: insertError } = await supabase
          .from('Users')
          .insert([{
            id: data.user.id,
            email: data.user.email || 'user@example.com',
            name: data.user.user_metadata?.name || 'User',
            bio: null,
            profile_picture: null,
            recovery_milestone: null,
          }])
          .select();
          
        if (insertError) throw insertError;
        
        if (newUserData && newUserData[0]) {
          const authUser: AuthUser = {
            id: newUserData[0].id,
            email: newUserData[0].email,
            name: newUserData[0].name,
            imageUrl: newUserData[0].profile_picture,
          };
          
          currentUser = authUser;
          listeners.forEach(listener => listener(currentUser));
          
          return { user: authUser, error: null };
        }
      } catch (createErr) {
        console.error('Error creating user profile on sign-in:', createErr);
      }
      
      // If we got here, we couldn't create a profile, but auth was successful
      // Return a basic user with just the auth data
      const basicUser: AuthUser = {
        id: data.user.id,
        email: data.user.email || email,
        name: data.user.user_metadata?.name || 'User',
      };
      
      currentUser = basicUser;
      listeners.forEach(listener => listener(currentUser));
      
      return { user: basicUser, error: null };
    }

    const authUser: AuthUser = {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      imageUrl: userData.profile_picture,
    };

    currentUser = authUser;
    
    // Notify listeners
    listeners.forEach(listener => listener(currentUser));

    return { user: authUser, error: null };
    
  } catch (error) {
    console.error('Sign-in error:', error);
    return { 
      user: null, 
      error: error instanceof Error ? error.message : 'An unknown error occurred during sign-in' 
    };
  }
};

// Sign out
export const signOutUser = async (): Promise<{ error: string | null }> => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) throw error;
    
    currentUser = null;
    
    // Notify listeners
    listeners.forEach(listener => listener(null));
    
    return { error: null };
    
  } catch (error) {
    console.error('Sign-out error:', error);
    return { 
      error: error instanceof Error ? error.message : 'An unknown error occurred during sign-out' 
    };
  }
};

// Add a listener for auth state changes
export const addAuthListener = (callback: (user: AuthUser | null) => void) => {
  listeners.push(callback);
  
  // Call with current state immediately
  callback(currentUser);
  
  // Return unsubscribe function
  return () => {
    const index = listeners.indexOf(callback);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  };
};

// Get the current user
export const getCurrentUser = (): AuthUser | null => {
  return currentUser;
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return currentUser !== null;
}; 