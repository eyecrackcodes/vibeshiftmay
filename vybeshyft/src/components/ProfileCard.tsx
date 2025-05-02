import { useState, useRef, useEffect } from 'react';
import { User, supabase } from '../lib/supabase';
import { sanitizeText } from '../lib/utils';
import { useUser } from '../lib/hooks';
import { uploadProfilePicture } from '../lib/storage';
import { useImageProxy } from '../hooks/useImageProxy';
import ImageFallback from './ImageFallback';

interface ProfileCardProps {
  profile: User;
  isOwner: boolean;
  onProfileUpdate: (updatedProfile: Partial<User>) => void;
}

const ProfileCard = ({ profile, isOwner, onProfileUpdate }: ProfileCardProps) => {
  const { user } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(profile.name);
  const [bio, setBio] = useState(profile.bio || '');
  const [milestone, setMilestone] = useState(profile.recovery_milestone || '');
  const [pictureUrl, setPictureUrl] = useState(profile.profile_picture || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate fallback avatar based on name
  const fallbackAvatar = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150' viewBox='0 0 150 150'%3E%3Crect width='150' height='150' fill='%23CCCCCC'/%3E%3Ctext x='75' y='75' font-family='Arial' font-size='40' text-anchor='middle' dominant-baseline='middle' fill='%23666666'%3E${encodeURIComponent(profile.name?.charAt(0) || '?')}%3C/text%3E%3C/svg%3E`;
  
  // Use our image proxy hook for both edit preview and profile view
  const { imageUrl: profileImageUrl } = useImageProxy(profile.profile_picture, fallbackAvatar);
  const { imageUrl: previewImageUrl } = useImageProxy(pictureUrl, fallbackAvatar);

  // Debug: Log profile picture URL when it changes
  useEffect(() => {
    if (profile.profile_picture) {
      console.log('Profile picture URL:', profile.profile_picture);
    }
  }, [profile.profile_picture]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      setIsUploading(true);
      setUploadError(null);

      const { url, error } = await uploadProfilePicture(file, user.id);
      
      if (error) {
        setUploadError(error.message);
        return;
      }
      
      if (url) {
        setPictureUrl(url);
        
        // Immediately update the preview
        console.log("Image uploaded successfully, URL:", url.substring(0, 50) + "...");
      }
    } catch (err) {
      setUploadError('Failed to upload image. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!isOwner || isSubmitting || !user) return;

    try {
      setIsSubmitting(true);
      setError(null);

      const updates = {
        name: sanitizeText(name.trim()),
        bio: bio.trim() ? sanitizeText(bio.trim()) : null,
        recovery_milestone: milestone.trim() ? sanitizeText(milestone.trim()) : null,
        profile_picture: pictureUrl.trim() || null,
      };
      
      console.log('Saving profile with picture URL:', updates.profile_picture);

      // First check if the Users table exists
      try {
        const { error: tableCheckError } = await supabase
          .from('Users')
          .select('id')
          .limit(1);
          
        if (tableCheckError) {
          // If table doesn't exist or can't be accessed, just update local state
          console.error('Users table error:', tableCheckError);
          onProfileUpdate(updates);
          setIsEditing(false);
          return;
        }
      } catch (tableError) {
        console.error('Error checking Users table:', tableError);
      }

      // Try to upsert the user profile
      const { error, data } = await supabase
        .from('Users')
        .upsert([{
          id: user.id,
          email: user.email || 'user@example.com',
          ...updates
        }])
        .select();

      if (error) throw error;
      
      console.log('Profile updated in database:', data);

      onProfileUpdate(updates);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card p-5">
      {isEditing ? (
        // Edit Mode
        <div className="space-y-5">
          <h2 className="text-xl font-semibold mb-4">Edit Profile</h2>
          
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
              {error}
            </div>
          )}
          
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input w-full"
              required
              maxLength={50}
            />
          </div>
          
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
              Bio
            </label>
            <div className="relative">
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="input w-full resize-none"
                placeholder="Share your superpower story!"
                rows={3}
                maxLength={250}
              ></textarea>
              <div className="absolute top-0 right-0 bg-blue-100 text-xs px-2 py-1 rounded-bl-md rounded-tr-md text-blue-700">
                <span className="tooltip cursor-help" data-tip="Sharing builds strength, not judgment.">
                  ℹ️ Myth: Sharing is risky. Truth: Your story builds community!
                </span>
              </div>
            </div>
            <div className="text-right text-xs text-gray-500 mt-1">
              {bio.length}/250 characters
            </div>
          </div>
          
          <div>
            <label htmlFor="milestone" className="block text-sm font-medium text-gray-700 mb-2">
              Recovery Milestone
            </label>
            <input
              id="milestone"
              type="text"
              value={milestone}
              onChange={(e) => setMilestone(e.target.value)}
              className="input w-full"
              placeholder="E.g., 30 days sober, 1 year nicotine-free"
              maxLength={50}
            />
            <p className="text-sm text-gray-500 mt-1">
              Celebrate your journey—add a milestone!
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile Picture
            </label>
            
            <div className="space-y-3">
              {/* File Upload Option */}
              <div className="flex flex-col">
                <div className="flex items-center space-x-2">
                  <button
                    type="button" 
                    onClick={() => fileInputRef.current?.click()}
                    className="btn btn-secondary text-sm"
                    disabled={isUploading}
                  >
                    {isUploading ? 'Uploading...' : 'Upload Image'}
                  </button>
                  <span className="text-xs text-gray-500">
                    JPG or PNG, max 2MB
                  </span>
                </div>
                
                <input 
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                
                {uploadError && (
                  <p className="mt-2 text-sm text-red-600">{uploadError}</p>
                )}
              </div>
              
              {/* Divider */}
              <div className="relative flex py-3 items-center">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink mx-3 text-gray-400 text-xs">or enter URL</span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>
              
              {/* URL Option */}
              <div>
                <input
                  id="pictureUrl"
                  type="url"
                  value={pictureUrl}
                  onChange={(e) => setPictureUrl(e.target.value)}
                  className="input w-full"
                  placeholder="https://example.com/your-image.jpg"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Paste a direct link to your image.
                </p>
              </div>
            </div>
            
            {pictureUrl && (
              <div className="mt-3 flex flex-col items-center">
                <p className="mb-2 text-sm text-gray-700">Preview:</p>
                <ImageFallback
                  src={previewImageUrl}
                  fallbackSrc={fallbackAvatar}
                  alt="Profile preview"
                  crossOrigin="anonymous"
                  className="w-24 h-24 rounded-full object-cover border border-gray-200"
                />
              </div>
            )}
          </div>
          
          <div className="flex justify-end space-x-3 pt-3">
            <button
              onClick={() => setIsEditing(false)}
              className="btn bg-gray-200 text-gray-800 hover:bg-gray-300"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="btn btn-primary"
              disabled={!name.trim() || isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </div>
      ) : (
        // View Mode
        <div className="flex flex-col items-center md:flex-row md:items-start">
          <div className="mb-5 md:mb-0 md:mr-6">
            <ImageFallback
              src={profileImageUrl}
              fallbackSrc={fallbackAvatar}
              alt={`${profile.name}'s profile`}
              crossOrigin="anonymous"
              className="w-32 h-32 rounded-full object-cover border-2 border-gray-200"
            />
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-bold">{profile.name}</h2>
            
            {profile.recovery_milestone && (
              <div className="mt-3 inline-block bg-secondary-light text-secondary-dark px-3 py-1 rounded-full text-sm font-medium">
                {profile.recovery_milestone}
              </div>
            )}
            
            {profile.bio && (
              <p className="mt-4 text-gray-700 whitespace-pre-line">
                <strong className="text-primary">My superpower:</strong> {profile.bio}
              </p>
            )}
            
            {isOwner && (
              <button
                onClick={() => setIsEditing(true)}
                className="mt-4 btn btn-secondary"
                aria-label="Edit your profile"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileCard; 