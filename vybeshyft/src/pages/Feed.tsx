import { useState, useEffect, useRef } from 'react';
import { supabase, Post } from '../lib/supabase';
import { sanitizeText, saveDraft, getDraft, clearDraft } from '../lib/utils';
import PostCard from '../components/PostCard';
import SignInButton from '../components/SignInButton';
import SOSButton from '../components/SOSButton';
import SuccessStories from '../components/SuccessStories';
import { useUser } from '../lib/hooks';
import { Link } from 'react-router-dom';

const POSTS_PER_PAGE = 10;

const Feed = () => {
  const { user, isSignedIn } = useUser();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const postDraftKey = 'new_post';
  const page = useRef(0);

  useEffect(() => {
    fetchPosts();
    
    // Load saved draft if exists
    const savedDraft = getDraft(postDraftKey);
    if (savedDraft) {
      setNewPost(savedDraft);
    }
  }, []);

  // Auto-save draft while typing
  useEffect(() => {
    if (newPost) {
      saveDraft(postDraftKey, newPost);
    }
  }, [newPost]);

  const fetchPosts = async (reset = true) => {
    try {
      if (reset) {
        setIsLoading(true);
        page.current = 0;
      } else {
        setIsLoadingMore(true);
        page.current += 1;
      }

      // Simplified query to just get posts without joins for now
      const { data: postsData, error: postsError } = await supabase
        .from('Posts')
        .select('*')
        .order('created_at', { ascending: false })
        .range(page.current * POSTS_PER_PAGE, (page.current + 1) * POSTS_PER_PAGE - 1);

      if (postsError) throw postsError;

      // Check if we have fewer posts than requested, meaning there are no more
      if (postsData.length < POSTS_PER_PAGE) {
        setHasMore(false);
      }

      // Create temporary formatted posts with placeholder data
      const formattedPosts = postsData.map((post: any) => {
        return {
          ...post,
          user_name: "User", // Placeholder
          user_profile_picture: null,
          likes_count: 0,
          comments_count: 0,
          has_liked: false
        };
      });

      if (reset) {
        setPosts(formattedPosts);
      } else {
        setPosts(prev => [...prev, ...formattedPosts]);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const handleSubmitPost = async () => {
    if (!isSignedIn || !newPost.trim() || isSubmitting || !user) return;

    try {
      setIsSubmitting(true);

      const postContent = sanitizeText(newPost.trim());
      const postImage = imageUrl.trim() ? sanitizeText(imageUrl.trim()) : null;

      const { data, error } = await supabase
        .from('Posts')
        .insert([{
          user_id: user.id,
          content: postContent,
          image_url: postImage
        }])
        .select();

      if (error) throw error;

      // Create a new post with basic data
      const newPostData: Post = {
        ...data[0],
        user_name: user.name || "User",
        user_profile_picture: user.imageUrl,
        likes_count: 0,
        comments_count: 0,
        has_liked: false
      };

      setPosts([newPostData, ...posts]);
      setNewPost('');
      setImageUrl('');
      clearDraft(postDraftKey);

    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLikeToggle = (postId: string, isLiked: boolean) => {
    setPosts(prev => 
      prev.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              has_liked: isLiked, 
              likes_count: isLiked ? (post.likes_count || 0) + 1 : Math.max((post.likes_count || 0) - 1, 0) 
            } 
          : post
      )
    );
  };

  const loadMorePosts = () => {
    if (!isLoadingMore && hasMore) {
      fetchPosts(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Sidebar */}
        <div className="md:col-span-1">
          <div className="card mb-6">
            <h2 className="text-xl font-bold mb-3">Welcome to VibeShift</h2>
            <p className="text-gray-600 mb-4">
              Discover your superpowers through shared stories of recovery and growth.
            </p>
            
            {/* SOS Emergency Help Button */}
            <div className="mb-6">
              <SOSButton />
            </div>
            
            {!isSignedIn && (
              <div className="bg-primary-light/20 p-4 rounded-md mb-4">
                <p className="mb-3 text-sm">
                  Join our supportive community today!
                </p>
                <SignInButton mode="signup" className="w-full btn btn-primary" />
              </div>
            )}
            
            <div className="bg-green-50 p-4 rounded-md">
              <h3 className="font-semibold text-green-800 mb-2">Did you know?</h3>
              <p className="text-sm text-green-700">
                90% of users feel empowered after sharing their recovery stories with our community!
              </p>
            </div>
          </div>
          
          {/* Success Stories Component */}
          <div className="card mb-6">
            <SuccessStories />
          </div>
        </div>
        
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Post Creation */}
          {isSignedIn ? (
            <div className="card mb-6">
              <h2 className="font-medium text-gray-700 mb-3">
                Share your superpower story!
              </h2>
              <div className="relative mb-2">
                <span className="absolute top-2 right-2 text-xs bg-gray-100 px-2 py-1 rounded-md text-gray-600">
                  Sharing builds strength, not judgment
                </span>
                <textarea
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  placeholder="What's your superpower today?"
                  className="w-full p-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  rows={4}
                  maxLength={2000}
                  aria-label="Create a new post"
                ></textarea>
              </div>
              
              <div className="mb-4">
                <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
                  Image URL (optional)
                </label>
                <input
                  id="imageUrl"
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/your-image.jpg"
                  className="input w-full"
                />
              </div>
              
              <div className="flex justify-between items-center">
                <small className="text-gray-500">
                  {newPost.length}/2000 characters
                </small>
                <button
                  onClick={handleSubmitPost}
                  disabled={!newPost.trim() || isSubmitting}
                  className="btn btn-primary"
                  aria-label="Post your story"
                >
                  {isSubmitting ? 'Posting...' : 'Celebrate Your Story'}
                </button>
              </div>
            </div>
          ) : (
            <div className="card mb-6 p-6 text-center">
              <h2 className="text-xl font-semibold mb-2">Sign in to share your story</h2>
              <p className="text-gray-600 mb-4">
                Join our community to share your journey and connect with others.
              </p>
              <SignInButton mode="signin" />
            </div>
          )}
          
          {/* Posts Feed */}
          {isLoading ? (
            <div className="text-center p-12">
              <p className="text-gray-500">Loading stories...</p>
            </div>
          ) : posts.length > 0 ? (
            <>
              <div className="space-y-6">
                {posts.map(post => (
                  <PostCard 
                    key={post.id} 
                    post={post} 
                    onLikeToggle={handleLikeToggle} 
                  />
                ))}
              </div>
              
              {hasMore && (
                <div className="text-center mt-6">
                  <button
                    onClick={loadMorePosts}
                    disabled={isLoadingMore}
                    className="btn btn-secondary"
                    aria-label="Load more posts"
                  >
                    {isLoadingMore ? 'Loading...' : 'Load More Stories'}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center p-12 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">No stories yet</h3>
              <p className="text-gray-600 mb-4">
                Be the first to share your superpower story!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Feed; 