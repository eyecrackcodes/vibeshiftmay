import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Navbar from '../Navbar';

// Mock the Clerk hooks
jest.mock('@clerk/clerk-react', () => ({
  useClerk: () => ({
    signOut: jest.fn(),
  }),
  useUser: () => ({
    isSignedIn: true,
    user: {
      id: 'user_123',
      imageUrl: 'https://example.com/avatar.jpg',
    },
  }),
}));

describe('Navbar', () => {
  const renderWithRouter = (ui: React.ReactElement) => {
    return render(ui, { wrapper: BrowserRouter });
  };

  test('renders logo and navigation links when signed in', () => {
    renderWithRouter(<Navbar />);
    
    // Check logo
    expect(screen.getByText('VibeShift')).toBeInTheDocument();
    expect(screen.getByText('Unlock Your Superpowers')).toBeInTheDocument();
    
    // Check navigation links
    expect(screen.getByText('Feed')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Sign Out')).toBeInTheDocument();
  });

  test('calls signOut when sign out button is clicked', () => {
    const mockSignOut = jest.fn();
    
    // Override the mock for this specific test
    require('@clerk/clerk-react').useClerk = () => ({
      signOut: mockSignOut,
    });
    
    renderWithRouter(<Navbar />);
    
    // Click sign out button
    const signOutButton = screen.getByText('Sign Out');
    fireEvent.click(signOutButton);
    
    // Check if signOut was called
    expect(mockSignOut).toHaveBeenCalled();
  });
}); 