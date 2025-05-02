import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import ImageFallback from './ImageFallback';

interface Story {
  id: string;
  title: string;
  excerpt: string;
  user_id: string;
  user_name: string;
  profile_picture?: string;
  created_at: string;
}

const SuccessStories = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Sample placeholder stories until we fetch real ones
  const placeholderStories: Story[] = [
    {
      id: '1',
      title: 'One Day at a Time',
      excerpt: 'After struggling with alcohol for 10 years, I found my superpower: patience. Taking recovery one day at a time changed everything.',
      user_id: '1',
      user_name: 'Sarah J.',
      profile_picture: undefined,
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      title: 'Finding My Voice Again',
      excerpt: 'Substance use took my voice away. Through community support, I not only found it again but now use it to help others.',
      user_id: '2',
      user_name: 'Michael T.',
      profile_picture: undefined,
      created_at: new Date().toISOString()
    },
    {
      id: '3',
      title: 'The Strength of Vulnerability',
      excerpt: 'I discovered that being vulnerable wasn\'t weakness—it was my greatest strength in recovery. Opening up saved me.',
      user_id: '3',
      user_name: 'Jamie K.',
      profile_picture: undefined,
      created_at: new Date().toISOString()
    }
  ];
  
  useEffect(() => {
    // In a real implementation, fetch curated stories from Supabase
    // For now, we'll use placeholder data
    setTimeout(() => {
      setStories(placeholderStories);
      setIsLoading(false);
    }, 800);
    
    // Commented out real implementation for future use
    /*
    const fetchStories = async () => {
      try {
        const { data, error } = await supabase
          .from('SuccessStories')
          .select('*, Users!inner(name, profile_picture)')
          .order('created_at', { ascending: false })
          .limit(3);
          
        if (error) throw error;
        
        if (data) {
          const formattedStories = data.map(story => ({
            ...story,
            user_name: story.Users.name,
            profile_picture: story.Users.profile_picture
          }));
          
          setStories(formattedStories);
        }
      } catch (err) {
        console.error('Error fetching success stories:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStories();
    */
  }, []);
  
  // Generate a fallback avatar based on initials
  const generateAvatarUrl = (name: string) => {
    const initial = name.charAt(0).toUpperCase();
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' fill='%23CCCCCC'/%3E%3Ctext x='20' y='20' font-family='Arial' font-size='16' text-anchor='middle' dominant-baseline='middle' fill='%23666666'%3E${initial}%3C/text%3E%3C/svg%3E`;
  };
  
  return (
    <div className="success-stories">
      <h3 className="text-lg font-semibold mb-4">Inspiring Journeys</h3>
      
      {isLoading ? (
        <div className="py-4 text-center text-gray-500">
          Loading stories...
        </div>
      ) : (
        <div className="space-y-4">
          {stories.map(story => (
            <div key={story.id} className="p-4 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center mb-3">
                <ImageFallback 
                  src={story.profile_picture} 
                  fallbackSrc={generateAvatarUrl(story.user_name)}
                  alt={`${story.user_name}'s profile`}
                  className="w-8 h-8 rounded-full mr-2 object-cover"
                />
                <span className="text-sm font-medium text-gray-700">{story.user_name}</span>
              </div>
              
              <h4 className="font-semibold text-primary mb-1">{story.title}</h4>
              <p className="text-sm text-gray-600 mb-2">{story.excerpt}</p>
              
              <Link to={`/stories/${story.id}`} className="text-xs font-medium text-primary hover:underline">
                Read full story →
              </Link>
            </div>
          ))}
          
          <div className="text-center pt-2">
            <Link to="/stories" className="text-sm font-medium text-secondary hover:underline">
              View all success stories
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuccessStories; 