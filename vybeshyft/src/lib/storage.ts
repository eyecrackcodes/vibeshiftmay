import { supabase } from './supabase';

// Initialize storage bucket if it doesn't exist
export const initStorage = async () => {
  try {
    console.log('Checking storage buckets...');
    
    // Assume bucket exists and try to upload a tiny test file to check permissions
    // This will either succeed, or fail with a specific error that tells us if the bucket exists
    const testFileName = `test-${Date.now()}.txt`;
    const { error: uploadError } = await supabase
      .storage
      .from('profile-pictures')
      .upload(testFileName, new Blob(['test']), {
        cacheControl: '0',
        upsert: true
      });
      
    if (uploadError) {
      if (uploadError.message.includes('bucket not found') || 
          uploadError.message.includes('does not exist')) {
        console.log('Profile-pictures bucket not found. Please create it in the Supabase dashboard with appropriate RLS policies.');
      } else if (uploadError.message.includes('permission denied') || 
                uploadError.message.includes('row-level security')) {
        console.log('Profile-pictures bucket exists but permission denied. Please check RLS policies.');
      } else {
        console.error('Error testing storage bucket:', uploadError);
      }
    } else {
      console.log('Profile-pictures bucket exists and is accessible.');
      
      // Clean up the test file
      await supabase
        .storage
        .from('profile-pictures')
        .remove([testFileName]);
    }
  } catch (error) {
    console.error('Error initializing storage:', error);
  }
};

// Upload a profile picture file and convert it to base64
export const uploadProfilePicture = async (file: File, userId: string): Promise<{ url: string | null; error: Error | null }> => {
  try {
    // Validate file
    if (!file) {
      return { url: null, error: new Error('No file selected') };
    }
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      return { url: null, error: new Error('Only image files are allowed') };
    }
    
    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return { url: null, error: new Error('File size must be less than 2MB') };
    }
    
    console.log('Converting image to base64...');
    
    // Convert file to base64
    return new Promise((resolve) => {
      const reader = new FileReader();
      
      reader.onloadend = () => {
        const base64String = reader.result as string;
        console.log('Image converted to base64 successfully');
        
        // Store the base64 image directly in the Users table
        // This way we don't need to rely on Supabase storage at all
        resolve({ 
          url: base64String, 
          error: null 
        });
      };
      
      reader.onerror = () => {
        console.error('Error reading file');
        resolve({ 
          url: null, 
          error: new Error('Error converting image to base64') 
        });
      };
      
      reader.readAsDataURL(file);
    });
    
  } catch (error) {
    console.error('Error processing profile picture:', error);
    return { 
      url: null, 
      error: error instanceof Error ? error : new Error('Unknown error uploading file') 
    };
  }
}; 