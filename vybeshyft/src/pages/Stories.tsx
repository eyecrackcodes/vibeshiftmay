import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
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

const Stories = () => {
  const { isSignedIn } = useUser();
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  
  // Sample placeholder stories until we fetch real ones
  const placeholderStories: Story[] = [
    {
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
    {
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
    {
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
    {
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
  ];
  
  // All unique tags from stories
  const allTags = [...new Set(placeholderStories.flatMap(story => story.tags || []))];
  
  useEffect(() => {
    // In a real implementation, fetch stories from Supabase
    // For now, we'll use placeholder data
    setTimeout(() => {
      setStories(placeholderStories);
      setIsLoading(false);
    }, 800);
  }, []);
  
  // Filter stories by tag if one is selected
  const filteredStories = activeTag 
    ? stories.filter(story => story.tags?.includes(activeTag)) 
    : stories;
  
  // Generate a fallback avatar based on initials
  const generateAvatarUrl = (name: string) => {
    const initial = name.charAt(0).toUpperCase();
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' fill='%23CCCCCC'/%3E%3Ctext x='20' y='20' font-family='Arial' font-size='16' text-anchor='middle' dominant-baseline='middle' fill='%23666666'%3E${initial}%3C/text%3E%3C/svg%3E`;
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800">Success Stories</h1>
          <p className="mt-2 text-gray-600">
            Real stories of recovery, resilience, and discovering superpowers
          </p>
        </div>
        
        {/* Tags filter */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => setActiveTag(null)}
              className={`px-3 py-1 rounded-full text-sm ${
                activeTag === null 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Stories
            </button>
            
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`px-3 py-1 rounded-full text-sm ${
                  activeTag === tag 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
        
        {isLoading ? (
          <div className="py-12 text-center text-gray-500">
            <p>Loading stories...</p>
          </div>
        ) : filteredStories.length > 0 ? (
          <div className="grid gap-6 md:gap-8">
            {filteredStories.map(story => (
              <div key={story.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <ImageFallback 
                      src={story.profile_picture} 
                      fallbackSrc={generateAvatarUrl(story.user_name)}
                      alt={`${story.user_name}'s profile`}
                      className="w-10 h-10 rounded-full mr-3 object-cover"
                    />
                    <div>
                      <h3 className="font-medium text-gray-800">{story.user_name}</h3>
                      <p className="text-xs text-gray-500">
                        {new Date(story.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  
                  <h2 className="text-xl font-bold text-primary mb-3">{story.title}</h2>
                  
                  <div className="mb-4 text-gray-600">
                    <p>{story.excerpt}</p>
                  </div>
                  
                  {story.tags && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {story.tags.map(tag => (
                        <span key={tag} className="bg-gray-100 text-xs text-gray-600 px-2 py-1 rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <Link 
                    to={`/stories/${story.id}`} 
                    className="inline-block bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors"
                  >
                    Read Full Story
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-gray-600">No stories found for this category.</p>
            <button
              onClick={() => setActiveTag(null)}
              className="mt-4 text-primary hover:underline"
            >
              View all stories
            </button>
          </div>
        )}
        
        {/* Submit your story section */}
        <div className="mt-12 bg-secondary-light/20 rounded-lg p-6 text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Share Your Success Story
          </h2>
          <p className="text-gray-600 mb-4">
            Your journey could inspire someone else's recovery. We'd love to feature your story.
          </p>
          
          {isSignedIn ? (
            <Link 
              to="/submit-story" 
              className="inline-block bg-secondary text-white px-6 py-3 rounded-md hover:bg-secondary-dark transition-colors"
            >
              Submit Your Story
            </Link>
          ) : (
            <div>
              <p className="mb-3 text-sm text-gray-600">
                Sign in to share your story
              </p>
              <Link 
                to="/sign-in" 
                className="inline-block bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Stories; 