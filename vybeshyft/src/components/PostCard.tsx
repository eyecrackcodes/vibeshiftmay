import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Post } from '../lib/supabase';
import { formatDate, sanitizeText } from '../lib/utils';
import { supabase } from '../lib/supabase';
import { useUser } from '../lib/hooks';

// Define a simple inline CommentSection component
const SimpleCommentSection = ({ postId }: { postId: string }) => {
  return (
    <div className="mt-4 pt-4 border-t border-gray-100">
      <div className="text-center p-4">
        <p className="text-gray-500">Comments are currently unavailable.</p>
      </div>
    </div>
  );
};

interface PostCardProps {
  post: Post;
  onLikeToggle: (postId: string, isLiked: boolean) => void;
}

const PostCard = ({ post, onLikeToggle }: PostCardProps) => {
  const { user, isSignedIn } = useUser();
  const [showComments, setShowComments] = useState(false);
  const [isLiked, setIsLiked] = useState(post.has_liked || false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [error, setError] = useState<string | null>(null);

  const toggleLike = async () => {
    if (!isSignedIn || !user) return;

    try {
      setError(null);
      const newIsLiked = !isLiked;
      
      // Check if the Likes table exists
      try {
        const { error: tableCheckError } = await supabase
          .from('Likes')
          .select('*')
          .limit(1);
          
        if (tableCheckError) {
          // If table doesn't exist, just update the UI state
          console.error('Likes table error:', tableCheckError);
          setIsLiked(newIsLiked);
          setLikesCount(newIsLiked ? likesCount + 1 : Math.max(likesCount - 1, 0));
          onLikeToggle(post.id, newIsLiked);
          return;
        }
      } catch (tableError) {
        console.error('Error checking Likes table:', tableError);
      }
      
      if (newIsLiked) {
        // Add like
        await supabase
          .from('Likes')
          .insert([{ post_id: post.id, user_id: user.id }]);
        setLikesCount(prev => prev + 1);
      } else {
        // Remove like
        await supabase
          .from('Likes')
          .delete()
          .match({ post_id: post.id, user_id: user.id });
        setLikesCount(prev => prev - 1);
      }
      
      setIsLiked(newIsLiked);
      onLikeToggle(post.id, newIsLiked);
    } catch (error) {
      console.error('Error toggling like:', error);
      setError('Unable to like post. Please try again.');
    }
  };

  return (
    <div className="card mb-4">
      {/* Error message */}
      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
          {error}
        </div>
      )}
      
      {/* Post Header */}
      <div className="flex items-center mb-3">
        <Link to={`/profile/${post.user_id}`}>
          <img 
            src={post.user_profile_picture || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' fill='%23CCCCCC'/%3E%3Ctext x='20' y='20' font-family='Arial' font-size='16' text-anchor='middle' dominant-baseline='middle' fill='%23666666'%3E" + encodeURIComponent(post.user_name?.charAt(0) || '?') + "%3C/text%3E%3C/svg%3E"} 
            alt={`${post.user_name}'s profile`}
            className="w-10 h-10 rounded-full mr-3"
          />
        </Link>
        <div>
          <Link to={`/profile/${post.user_id}`} className="font-medium hover:underline">
            {post.user_name}
          </Link>
          <p className="text-xs text-gray-500">{formatDate(post.created_at)}</p>
        </div>
      </div>

      {/* Post Content */}
      <div className="mb-4">
        <p className="whitespace-pre-line">{sanitizeText(post.content)}</p>
        {post.image_url && (
          <img 
            src={post.image_url} 
            alt="Post image" 
            className="mt-3 rounded-lg max-h-96 w-auto"
            loading="lazy"
          />
        )}
      </div>

      {/* Post Actions */}
      <div className="flex items-center text-sm text-gray-500 border-t pt-3">
        <button 
          onClick={toggleLike}
          className={`flex items-center mr-4 ${isLiked ? 'text-primary' : ''}`}
          disabled={!isSignedIn}
          aria-label={isLiked ? 'Unlike post' : 'Like post'}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            fill={isLiked ? "currentColor" : "none"}
            viewBox="0 0 24 24" 
            stroke="currentColor" 
            className="w-5 h-5 mr-1"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          {likesCount} {likesCount === 1 ? 'Like' : 'Likes'}
        </button>

        <button 
          onClick={() => setShowComments(!showComments)}
          className="flex items-center"
          aria-label={showComments ? 'Hide comments' : 'Show comments'}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor" 
            className="w-5 h-5 mr-1"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
          {post.comments_count || 0} {post.comments_count === 1 ? 'Comment' : 'Comments'}
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <SimpleCommentSection postId={post.id} />
      )}
    </div>
  );
};

export default PostCard; 