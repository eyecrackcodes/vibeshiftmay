import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import PostCard from '../PostCard';
import { Post } from '../../lib/supabase';

// Mock CommentSection to avoid testing its implementation
jest.mock('../CommentSection', () => {
  return {
    __esModule: true,
    default: () => <div data-testid="comment-section">Comment Section</div>
  };
});

describe('PostCard', () => {
  const mockPost: Post = {
    id: 'post_123',
    user_id: 'user_456',
    content: 'This is a test post content',
    image_url: 'https://example.com/image.jpg',
    created_at: '2023-05-01T12:00:00Z',
    user_name: 'Test User',
    user_profile_picture: 'https://example.com/avatar.jpg',
    likes_count: 5,
    comments_count: 2,
    has_liked: false
  };

  const mockOnLikeToggle = jest.fn();

  const renderWithRouter = (ui: React.ReactElement) => {
    return render(ui, { wrapper: BrowserRouter });
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders post content correctly', () => {
    renderWithRouter(<PostCard post={mockPost} onLikeToggle={mockOnLikeToggle} />);
    
    // Check user information
    expect(screen.getByText('Test User')).toBeInTheDocument();
    
    // Check post content
    expect(screen.getByText('This is a test post content')).toBeInTheDocument();
    
    // Check image
    const image = screen.getByAltText('Post image');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
    
    // Check like count
    expect(screen.getByText('5 Likes')).toBeInTheDocument();
    
    // Check comment count
    expect(screen.getByText('2 Comments')).toBeInTheDocument();
  });

  test('handles like button click', () => {
    renderWithRouter(<PostCard post={mockPost} onLikeToggle={mockOnLikeToggle} />);
    
    // Click like button
    const likeButton = screen.getByLabelText('Like post');
    fireEvent.click(likeButton);
    
    // Check if onLikeToggle was called with the right arguments
    expect(mockOnLikeToggle).toHaveBeenCalledWith('post_123', true);
  });

  test('toggles comment section when comment button is clicked', () => {
    renderWithRouter(<PostCard post={mockPost} onLikeToggle={mockOnLikeToggle} />);
    
    // Initially, comment section should not be visible
    expect(screen.queryByTestId('comment-section')).not.toBeInTheDocument();
    
    // Click comment button
    const commentButton = screen.getByLabelText('Show comments');
    fireEvent.click(commentButton);
    
    // Comment section should now be visible
    expect(screen.getByTestId('comment-section')).toBeInTheDocument();
    
    // Click again to hide
    fireEvent.click(commentButton);
    
    // Comment section should be hidden again
    expect(screen.queryByTestId('comment-section')).not.toBeInTheDocument();
  });
}); 