import '@testing-library/jest-dom';
import React from 'react';

// Extend Window interface to include ENV
declare global {
  interface Window {
    ENV: {
      VITE_CLERK_PUBLISHABLE_KEY: string;
      VITE_SUPABASE_URL: string;
      VITE_SUPABASE_ANON_KEY: string;
    };
  }
}

// Mock environment variables
window.ENV = {
  VITE_CLERK_PUBLISHABLE_KEY: 'test_key',
  VITE_SUPABASE_URL: 'https://test.supabase.co',
  VITE_SUPABASE_ANON_KEY: 'test_key',
};

// Mock the Clerk authentication
jest.mock('@clerk/clerk-react', () => ({
  useUser: jest.fn(() => ({
    isSignedIn: true,
    user: {
      id: 'user_123',
      imageUrl: 'https://example.com/avatar.jpg',
    },
  })),
  useClerk: jest.fn(() => ({
    signOut: jest.fn(),
    openSignIn: jest.fn(),
    openSignUp: jest.fn(),
  })),
  SignedIn: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children),
  SignedOut: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children),
  ClerkProvider: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children),
}));

// Mock Supabase
jest.mock('../lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => ({
            data: null,
            error: null,
          })),
          order: jest.fn(() => ({
            range: jest.fn(() => ({
              data: [],
              error: null,
            })),
          })),
        })),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          data: [],
          error: null,
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          data: null,
          error: null,
        })),
      })),
      delete: jest.fn(() => ({
        match: jest.fn(() => ({
          data: null,
          error: null,
        })),
      })),
    })),
  },
})); 