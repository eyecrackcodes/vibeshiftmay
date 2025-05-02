import { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { supabase, User, Post } from '../lib/supabase';
import ProfileCard from '../components/ProfileCard';
import PostCard from '../components/PostCard';
import SignInButton from '../components/SignInButton';
import { useUser } from '../lib/hooks';

const Profile = () => {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser, isSignedIn, isLoaded } = useUser();
  const [profile, setProfile] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isOwner = isSignedIn && currentUser?.id === id ? true : false;

  useEffect(() => {
    if (id) {
      fetchProfile();
      fetchUserPosts();
    }
  }, [id]);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      
      // First check if the table exists and create a basic profile if needed
      if (isOwner && currentUser) {
        // Try to create a profile for the current user if one doesn't exist
        const { error: upsertError } = await supabase
          .from('Users')
          .upsert([{
            id: currentUser.id,
            email: currentUser.email || 'user@example.com',
            name: currentUser.name || 'User',
            bio: null,
            profile_picture: currentUser.imageUrl || null,
            recovery_milestone: null
          }]);
          
        if (upsertError) {
          console.error('Error creating profile:', upsertError);
        }
      }
      
      // Now fetch the profile
      const { data, error } = await supabase
        .from('Users')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        // If the profile doesn't exist in the database, create a temporary one
        if (isOwner && currentUser) {
          setProfile({
            id: currentUser.id,
            email: currentUser.email || 'user@example.com',
            name: currentUser.name || 'User',
            bio: null,
            profile_picture: currentUser.imageUrl || null,
            recovery_milestone: null
          });
        } else {
          throw error;
        }
      } else if (data) {
        setProfile(data as User);
      } else {
        setError('Profile not found');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserPosts = async () => {
    try {
      // Simplified query to just get posts without joins
      const { data, error } = await supabase
        .from('Posts')
        .select('*')
        .eq('user_id', id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Create simple post objects without join data
      const formattedPosts = data.map((post: any) => {
        return {
          ...post,
          user_name: profile?.name || "User",
          user_profile_picture: profile?.profile_picture || null,
          likes_count: 0,
          comments_count: 0,
          has_liked: false
        };
      });
      
      setPosts(formattedPosts);
    } catch (error) {
      console.error('Error fetching user posts:', error);
      setPosts([]);
    }
  };

  const handleProfileUpdate = (updatedProfile: Partial<User>) => {
    if (profile) {
      console.log('Profile updated with new data:', updatedProfile);
      
      // Force a refresh of the profile image by appending a timestamp
      if (updatedProfile.profile_picture) {
        const timestamp = Date.now();
        const refreshedUrl = updatedProfile.profile_picture.includes('?') 
          ? `${updatedProfile.profile_picture}&_t=${timestamp}` 
          : `${updatedProfile.profile_picture}?_t=${timestamp}`;
          
        updatedProfile.profile_picture = refreshedUrl;
      }
      
      setProfile({
        ...profile,
        ...updatedProfile
      });
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

  // Wait for authentication to load
  if (!isLoaded) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p>Loading...</p>
      </div>
    );
  }
  
  // Redirect if no ID
  if (!id) {
    return <Navigate to="/feed" />;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading profile...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-bold text-red-500 mb-2">{error}</h2>
          {!isSignedIn && (
            <div className="mt-4">
              <p className="mb-3">Sign in to view profiles</p>
              <SignInButton mode="signin" />
            </div>
          )}
        </div>
      ) : profile ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Sidebar */}
          <div className="md:col-span-1">
            <ProfileCard 
              profile={profile} 
              isOwner={isOwner} 
              onProfileUpdate={handleProfileUpdate} 
            />
            
            <div className="card mt-6 bg-secondary-light/20">
              <h3 className="font-semibold mb-2">The Power of Sharing</h3>
              <p className="text-sm text-gray-700 mb-3">
                When we share our stories, we not only inspire others but also strengthen our own resolve.
              </p>
              <blockquote className="italic text-sm border-l-4 border-secondary pl-3 py-1">
                "Your struggle today is developing the strength you need for tomorrow."
              </blockquote>
            </div>
          </div>
          
          {/* User Posts */}
          <div className="md:col-span-2">
            <h2 className="text-xl font-bold mb-4">{profile.name}'s Stories</h2>
            
            {posts.length > 0 ? (
              <div className="space-y-6">
                {posts.map(post => (
                  <PostCard 
                    key={post.id} 
                    post={post} 
                    onLikeToggle={handleLikeToggle} 
                  />
                ))}
              </div>
            ) : (
              <div className="text-center p-12 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">No stories yet</h3>
                <p className="text-gray-600">
                  {isOwner ? 
                    "You haven't shared any stories yet. Head to the feed to share your first story!" :
                    `${profile.name} hasn't shared any stories yet.`
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Profile; 