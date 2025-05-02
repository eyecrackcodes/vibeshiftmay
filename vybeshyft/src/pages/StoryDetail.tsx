import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import ImageFallback from '../components/ImageFallback';
import { useUser } from '../lib/hooks';

interface Story {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  user_id: string;
  user_name: string;
  profile_picture?: string;
  created_at: string;
  tags?: string[];
}

const StoryDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [story, setStory] = useState<Story | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Sample placeholder stories until we fetch real ones
  const placeholderStories: Record<string, Story> = {
    '1': {
      id: '1',
      title: 'One Day at a Time: My Journey to Sobriety',
      content: "<p>After struggling with alcohol for 10 years, I found my superpower: patience. Taking recovery one day at a time changed everything.</p><p>The journey began when I hit rock bottom. I lost my job, my relationships were strained, and I barely recognized myself anymore. It was a dark time, but it was also the beginning of my transformation.</p><p>I remember my first day of sobriety vividly. The shakes, the anxiety, the overwhelming fear. But I made it through. And then I made it through another day. And another.</p><p>What I've learned is that recovery isn't about big, dramatic changes. It's about the small choices we make every single day. It's about choosing water instead of wine at dinner. It's about calling a friend when the cravings hit instead of heading to the liquor store.</p><p>My superpower of patience has taught me that healing isn't linear. There are good days and bad days. But as long as I focus on just today, I can handle whatever comes my way.</p><p>If you're struggling, remember: you only need to stay sober today. Tomorrow will take care of itself.</p>",
      excerpt: 'After struggling with alcohol for 10 years, I found my superpower: patience. Taking recovery one day at a time changed everything.',
      user_id: '1',
      user_name: 'Sarah J.',
      profile_picture: undefined,
      created_at: '2023-06-15T12:00:00Z',
      tags: ['alcohol', 'sobriety', 'patience']
    },
    '2': {
      id: '2',
      title: 'Finding My Voice Again: Overcoming Addiction',
      content: "<p>Substance use took my voice away. Through community support, I not only found it again but now use it to help others.</p><p>For years, I was silent about my struggles. The shame kept me isolated, and the isolation fed my addiction. It was a vicious cycle that I couldn't break on my own.</p><p>Joining a support group was the hardest and best decision I ever made. Sitting in that circle on the first day, listening to others share their stories so openly - it was terrifying and liberating at the same time.</p><p>When I finally spoke up, sharing my own story for the first time, something shifted inside me. The burden I'd been carrying for so long felt lighter. The shame began to dissolve.</p><p>Now, five years into recovery, I lead support groups myself. Using my voice to help others find theirs is the most fulfilling thing I've ever done. It reminds me daily that our greatest struggles can become our greatest strengths.</p><p>Your voice matters. Your story matters. And sharing it might just be the key to your healing - and someone else's.</p>",
      excerpt: 'Substance use took my voice away. Through community support, I not only found it again but now use it to help others.',
      user_id: '2',
      user_name: 'Michael T.',
      profile_picture: undefined,
      created_at: '2023-07-22T15:30:00Z',
      tags: ['support groups', 'community', 'speaking up']
    },
    '3': {
      id: '3',
      title: 'The Strength of Vulnerability',
      content: "<p>I discovered that being vulnerable wasn't weakness—it was my greatest strength in recovery. Opening up saved me.</p><p>Growing up, I was taught that showing emotions was a sign of weakness. \"Real men don't cry,\" my father would say. So I bottled everything up - the pain, the fear, the insecurities. And when it all became too much, I turned to substances to numb the overflow.</p><p>Recovery forced me to confront everything I'd been avoiding. I had to learn that vulnerability isn't weakness - it's courage in its purest form.</p><p>The first time I openly cried in therapy was a breakthrough. The first time I told someone \"I'm struggling today\" instead of \"I'm fine\" was a victory. Each moment of vulnerability brought me closer to healing.</p><p>Now I understand that strength isn't about carrying everything alone. It's about having the courage to reach out, to let others see your authentic self - struggles and all.</p><p>If you're hiding behind a mask of \"I'm fine,\" I encourage you to take it off. Your vulnerability might just be your superpower.</p>",
      excerpt: 'I discovered that being vulnerable wasn\'t weakness—it was my greatest strength in recovery. Opening up saved me.',
      user_id: '3',
      user_name: 'Jamie K.',
      profile_picture: undefined,
      created_at: '2023-08-05T09:45:00Z',
      tags: ['vulnerability', 'emotional health', 'authenticity']
    },
    '4': {
      id: '4',
      title: 'Reclaiming My Future After Opioid Addiction',
      content: "<p>After a sports injury led to opioid addiction, I had to rebuild my life from scratch. Here's how I reclaimed my future.</p><p>It started with a legitimate prescription after a football injury in college. By the time I realized I had a problem, I was taking four times the prescribed dose and still feeling pain - not physical pain anymore, but the pain of dependency.</p><p>Withdrawal was the hardest thing I've ever gone through. There were moments I wasn't sure I'd make it. But with medical support and a determination I didn't know I possessed, I pushed through.</p><p>Recovery meant redefining everything - my identity, my friends, my goals. I had to let go of the future I'd imagined and create a new one. At first, that felt like a loss. Now I see it was an opportunity.</p><p>Today, I'm a recovery coach and personal trainer. I help others heal both physically and mentally. My past doesn't define me, but it does inform the work I do and the compassion I bring to it.</p><p>If you're in the grip of opioid addiction, please know that recovery is possible. Your future is still waiting for you to reclaim it.</p>",
      excerpt: 'After a sports injury led to opioid addiction, I had to rebuild my life from scratch. Here\'s how I reclaimed my future.',
      user_id: '4',
      user_name: 'Devon R.',
      profile_picture: undefined,
      created_at: '2023-09-18T14:15:00Z',
      tags: ['opioids', 'pain management', 'career change']
    }
  };
  
  useEffect(() => {
    if (!id) {
      navigate('/stories');
      return;
    }
    
    // In a real implementation, fetch the story from Supabase
    // For now, we'll use placeholder data
    setTimeout(() => {
      if (id && placeholderStories[id]) {
        setStory(placeholderStories[id]);
      } else {
        setError('Story not found');
      }
      setIsLoading(false);
    }, 800);
    
    // Commented out real implementation for future use
    /*
    const fetchStory = async () => {
      try {
        const { data, error } = await supabase
          .from('SuccessStories')
          .select('*, Users!inner(name, profile_picture)')
          .eq('id', id)
          .single();
          
        if (error) throw error;
        
        if (data) {
          setStory({
            ...data,
            user_name: data.Users.name,
            profile_picture: data.Users.profile_picture
          });
        } else {
          setError('Story not found');
        }
      } catch (err) {
        console.error('Error fetching story:', err);
        setError('Failed to load story');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStory();
    */
  }, [id, navigate]);
  
  // Generate a fallback avatar based on initials
  const generateAvatarUrl = (name: string) => {
    const initial = name?.charAt(0).toUpperCase() || '?';
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' fill='%23CCCCCC'/%3E%3Ctext x='20' y='20' font-family='Arial' font-size='16' text-anchor='middle' dominant-baseline='middle' fill='%23666666'%3E${initial}%3C/text%3E%3C/svg%3E`;
  };
  
  // Get a list of related stories based on tags
  const getRelatedStories = () => {
    if (!story || !story.tags || story.tags.length === 0) return [];
    
    return Object.values(placeholderStories)
      .filter(s => s.id !== story.id && s.tags?.some(tag => story.tags?.includes(tag)))
      .slice(0, 3);
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="text-center py-8">
            <p className="text-gray-500">Loading story...</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !story) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="text-center py-8">
            <h2 className="text-xl font-bold text-red-500 mb-4">{error || 'Story not found'}</h2>
            <Link to="/stories" className="text-primary hover:underline">
              Back to all stories
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  const relatedStories = getRelatedStories();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* Navigation */}
        <div className="mb-6">
          <Link to="/stories" className="text-primary hover:underline flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to all stories
          </Link>
        </div>
        
        {/* Story Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">{story.title}</h1>
          
          <div className="flex items-center mb-6">
            <ImageFallback 
              src={story.profile_picture} 
              fallbackSrc={generateAvatarUrl(story.user_name)}
              alt={`${story.user_name}'s profile`}
              className="w-12 h-12 rounded-full mr-4 object-cover"
            />
            <div>
              <Link to={`/profile/${story.user_id}`} className="font-medium text-gray-800 hover:underline">
                {story.user_name}
              </Link>
              <p className="text-sm text-gray-500">
                {new Date(story.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
          
          {story.tags && (
            <div className="flex flex-wrap gap-2 mb-6">
              {story.tags.map(tag => (
                <Link 
                  key={tag} 
                  to={`/stories?tag=${tag}`} 
                  className="bg-gray-100 text-sm text-gray-600 px-3 py-1 rounded-full hover:bg-gray-200"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}
        </div>
        
        {/* Story Content */}
        <div className="prose prose-lg max-w-none mb-10">
          <div dangerouslySetInnerHTML={{ __html: story.content }} />
        </div>
        
        {/* Share and Support */}
        <div className="bg-primary-light/10 rounded-lg p-6 mb-10">
          <h3 className="text-xl font-semibold mb-3">Need Support?</h3>
          <p className="mb-4">
            If you're struggling with similar issues, remember that help is always available.
          </p>
          <div className="flex flex-wrap gap-4">
            <a 
              href="tel:1-800-662-4357" 
              className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors"
            >
              Call SAMHSA Helpline
            </a>
            <Link 
              to="/resources" 
              className="bg-white text-primary border border-primary px-4 py-2 rounded-md hover:bg-gray-50 transition-colors"
            >
              Find Resources
            </Link>
          </div>
        </div>
        
        {/* Related Stories */}
        {relatedStories.length > 0 && (
          <div className="border-t border-gray-200 pt-8 mt-8">
            <h3 className="text-xl font-semibold mb-6">Related Stories</h3>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {relatedStories.map(relatedStory => (
                <div key={relatedStory.id} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="p-4">
                    <h4 className="font-semibold text-primary mb-2 line-clamp-2">
                      <Link to={`/stories/${relatedStory.id}`} className="hover:underline">
                        {relatedStory.title}
                      </Link>
                    </h4>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                      {relatedStory.excerpt}
                    </p>
                    <div className="flex items-center text-xs text-gray-500">
                      <ImageFallback 
                        src={relatedStory.profile_picture} 
                        fallbackSrc={generateAvatarUrl(relatedStory.user_name)}
                        alt={`${relatedStory.user_name}'s profile`}
                        className="w-5 h-5 rounded-full mr-1 object-cover"
                      />
                      <span>{relatedStory.user_name}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoryDetail; 