import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase, Comment } from '../lib/supabase';
import { sanitizeText, formatDate, saveDraft, getDraft, clearDraft } from '../lib/utils';
import { useUser } from '../lib/hooks';

interface CommentSectionProps {
  postId: string;
}

const CommentSection = ({ postId }: CommentSectionProps) => {
  const { user, isSignedIn } = useUser();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const draftKey = `comment_${postId}`;
  
  useEffect(() => {
    // Load saved draft if exists
    const savedDraft = getDraft(draftKey);
    if (savedDraft) {
      setNewComment(savedDraft);
    }
    
    // Check if Comments table exists and handle errors
    checkCommentsTable();
  }, [postId]);
  
  // Auto-save draft while typing
  useEffect(() => {
    if (newComment) {
      saveDraft(draftKey, newComment);
    }
  }, [newComment, draftKey]);
  
  const checkCommentsTable = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Simple query to check if the Comments table exists
      const { data, error } = await supabase
        .from('Comments')
        .select('*')
        .limit(1);
        
      if (error) {
        console.error('Error checking Comments table:', error);
        setError('Unable to load comments at this time.');
        setComments([]);
        return;
      }
      
      // If no error, fetch comments for this post
      fetchComments();
    } catch (err) {
      console.error('Error in checkCommentsTable:', err);
      setError('Unable to load comments at this time.');
      setComments([]);
      setIsLoading(false);
    }
  };
  
  const fetchComments = async () => {
    try {
      // Simplified query to just get comments without joins
      const { data, error } = await supabase
        .from('Comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      // Create simple comment objects
      const formattedComments = data.map((comment: any) => ({
        ...comment,
        user_name: "User", // Placeholder
        user_profile_picture: null,
      }));
      
      setComments(formattedComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
      setError('Failed to load comments.');
      setComments([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSubmit = async () => {
    if (!isSignedIn || !newComment.trim() || isSubmitting || !user) return;
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Insert the comment
      const { data, error } = await supabase
        .from('Comments')
        .insert([{
          post_id: postId,
          user_id: user.id,
          content: sanitizeText(newComment.trim()),
          created_at: new Date().toISOString()
        }])
        .select();
        
      if (error) throw error;
      
      if (!data || data.length === 0) {
        throw new Error('No data returned from insert');
      }
      
      // Add the new comment to the list
      const newCommentData: Comment = {
        ...data[0],
        user_name: user.name || "User",
        user_profile_picture: user.imageUrl,
      };
      
      setComments([newCommentData, ...comments]);
      setNewComment('');
      clearDraft(draftKey);
      
    } catch (error) {
      console.error('Error adding comment:', error);
      setError('Failed to post comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="mt-4 pt-4 border-t border-gray-100">
      {/* Error message */}
      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
          {error}
        </div>
      )}
      
      {/* Comment Form */}
      {isSignedIn ? (
        <div className="flex mb-4">
          <img 
            src={user?.imageUrl || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%23CCCCCC'/%3E%3Ctext x='16' y='16' font-family='Arial' font-size='14' text-anchor='middle' dominant-baseline='middle' fill='%23666666'%3E" + encodeURIComponent(user?.name?.charAt(0) || '?') + "%3C/text%3E%3C/svg%3E"} 
            alt="Your profile"
            className="w-8 h-8 rounded-full mr-2"
          />
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts or encouragement..."
              className="w-full p-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              rows={2}
              maxLength={500}
              aria-label="Add a comment"
            ></textarea>
            <div className="flex justify-between items-center mt-2">
              <small className="text-gray-500">
                {newComment.length}/500 characters
              </small>
              <button 
                onClick={handleSubmit}
                disabled={!newComment.trim() || isSubmitting}
                className="btn btn-primary py-1 px-3 text-sm"
                aria-label="Submit your comment"
              >
                {isSubmitting ? 'Posting...' : 'Post Comment'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 p-3 rounded-md mb-4 text-center">
          <p className="text-sm text-gray-600">
            <Link to="/sign-in" className="text-primary hover:underline">Sign in</Link> to share your thoughts
          </p>
        </div>
      )}
      
      {/* Comments List */}
      <div>
        {isLoading ? (
          <div className="text-center p-4">
            <p className="text-gray-500">Loading comments...</p>
          </div>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="flex mb-4">
              <Link to={`/profile/${comment.user_id}`}>
                <img 
                  src={comment.user_profile_picture || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%23CCCCCC'/%3E%3Ctext x='16' y='16' font-family='Arial' font-size='14' text-anchor='middle' dominant-baseline='middle' fill='%23666666'%3E" + encodeURIComponent(comment.user_name?.charAt(0) || '?') + "%3C/text%3E%3C/svg%3E"} 
                  alt={`${comment.user_name}'s profile`}
                  className="w-8 h-8 rounded-full mr-2"
                />
              </Link>
              <div className="bg-gray-50 p-3 rounded-md flex-1">
                <div className="flex justify-between items-start mb-1">
                  <Link to={`/profile/${comment.user_id}`} className="font-medium text-sm hover:underline">
                    {comment.user_name}
                  </Link>
                  <span className="text-xs text-gray-500">{formatDate(comment.created_at)}</span>
                </div>
                <p className="text-sm whitespace-pre-line">{comment.content}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center p-4">
            <p className="text-gray-500">No comments yet. Be the first to share!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentSection; 