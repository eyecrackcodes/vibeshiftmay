import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

/**
 * A hook to handle loading images with fallbacks and proxying for CORS issues
 */
export const useImageProxy = (originalUrl: string | null | undefined, fallbackUrl: string) => {
  const [imageUrl, setImageUrl] = useState<string>(fallbackUrl);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Reset state when URL changes
    setIsLoading(true);
    setError(null);

    if (!originalUrl) {
      setImageUrl(fallbackUrl);
      setIsLoading(false);
      return;
    }

    // If it's a base64 image, use it directly
    if (originalUrl.startsWith('data:image/')) {
      setImageUrl(originalUrl);
      setIsLoading(false);
      return;
    }

    // For Supabase Storage URLs, try to get a fresh URL
    if (originalUrl.includes('supabase.co/storage/v1')) {
      // Extract the file path from the URL
      // Example URL: https://xxx.supabase.co/storage/v1/object/public/profile-pictures/file.jpg
      const urlParts = originalUrl.split('/profile-pictures/');
      
      if (urlParts.length === 2) {
        const fileName = urlParts[1].split('?')[0]; // Remove query params if any
        
        // Get a fresh URL directly from Supabase
        const { data } = supabase
          .storage
          .from('profile-pictures')
          .getPublicUrl(fileName);
          
        if (data && data.publicUrl) {
          console.log('Generated fresh URL:', data.publicUrl);
          
          // Add cache buster
          const cacheBuster = Date.now();
          const freshUrl = `${data.publicUrl}?t=${cacheBuster}`;
          
          // Set the fresh URL
          setImageUrl(freshUrl);
          setIsLoading(false);
          return;
        }
      }
    }
    
    // For non-Supabase URLs, try to load directly
    const img = new Image();
    
    // Add cache buster to avoid caching issues
    const cacheBuster = Date.now();
    const urlWithCacheBuster = originalUrl.includes('?') 
      ? `${originalUrl}&t=${cacheBuster}` 
      : `${originalUrl}?t=${cacheBuster}`;
    
    img.crossOrigin = "anonymous";
    
    img.onload = () => {
      setImageUrl(urlWithCacheBuster);
      setIsLoading(false);
    };
    
    img.onerror = () => {
      console.warn(`Image failed to load directly: ${originalUrl}`);
      
      // Use fallback
      setImageUrl(fallbackUrl);
      setIsLoading(false);
    };
    
    img.src = urlWithCacheBuster;
    
    // Cleanup
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [originalUrl, fallbackUrl]);

  return { imageUrl, isLoading, error };
}; 