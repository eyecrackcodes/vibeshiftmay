import { useState, useEffect } from 'react';
import { 
  addAuthListener, 
  getCurrentUser, 
  isAuthenticated as checkIsAuthenticated, 
  signOutUser,
  AuthUser
} from './auth';

// Replacement for useUser from Clerk
export const useUser = () => {
  const [user, setUser] = useState<AuthUser | null>(getCurrentUser());
  const [isSignedIn, setIsSignedIn] = useState<boolean>(checkIsAuthenticated());
  const [isLoaded, setIsLoaded] = useState<boolean>(true); // We don't have loading state in our simple auth

  useEffect(() => {
    // Subscribe to auth changes
    const unsubscribe = addAuthListener((user) => {
      setUser(user);
      setIsSignedIn(!!user);
    });

    // Clean up subscription
    return () => unsubscribe();
  }, []);

  return {
    user,
    isSignedIn,
    isLoaded
  };
};

// Replacement for useClerk from Clerk
export const useClerk = () => {
  // We only implement the methods we use in the app
  return {
    signOut: async () => {
      await signOutUser();
    },
    openSignIn: ({ redirectUrl }: { redirectUrl: string }) => {
      // Navigate to sign-in page
      window.location.href = '/sign-in';
    },
    openSignUp: ({ redirectUrl }: { redirectUrl: string }) => {
      // Navigate to sign-up page
      window.location.href = '/sign-up';
    }
  };
}; 