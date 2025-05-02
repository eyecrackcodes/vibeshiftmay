import { useState } from 'react';
import { supabase } from './lib/supabase';
import { useNavigate } from 'react-router-dom';
import { signInUser } from './lib/auth';

const TestUser = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const createTestUser = async () => {
    setIsCreating(true);
    setError(null);
    setMessage(null);
    
    try {
      // Create a test user with Supabase Auth
      const timestamp = Date.now();
      const testEmail = `testuser${timestamp}@gmail.com`;
      const testPassword = 'Password123!';
      
      setMessage('Creating auth user...');
      
      // Using service role to bypass email verification for testing
      // Note: This works only in development and requires a service key
      const serviceSupabase = supabase;
      
      // Create user directly with admin privileges
      const { data: adminAuthData, error: adminAuthError } = await serviceSupabase.auth.admin.createUser({
        email: testEmail,
        password: testPassword,
        email_confirm: true, // Auto-confirm the email
        user_metadata: {
          name: 'Test User'
        }
      });
      
      if (adminAuthError) throw adminAuthError;
      
      if (!adminAuthData.user) {
        throw new Error('Failed to create user');
      }
      
      setMessage('Test user created! Signing in...');
      
      // Sign in with the newly created user
      const { user, error: signInError } = await signInUser(testEmail, testPassword);
      
      if (signInError) throw new Error(signInError);
      
      if (!user) {
        throw new Error('Failed to sign in with new user');
      }
      
      setMessage(`
        Successfully created and signed in as test user!
        Email: ${testEmail}
        Password: ${testPassword}
        
        Redirecting to feed...
      `);
      
      // Redirect to feed after a short delay
      setTimeout(() => {
        navigate('/feed');
      }, 2000);
      
    } catch (err) {
      console.error('Error creating test user:', err);
      
      // If creation failed due to admin API, try regular sign-up
      if (String(err).includes('admin')) {
        setMessage(`
          Admin API not available. Please use normal sign-up.
          
          Error: ${err instanceof Error ? err.message : String(err)}
        `);
      } else {
        setError(err instanceof Error ? err.message : 'Unknown error creating test user');
      }
    } finally {
      setIsCreating(false);
    }
  };
  
  // Add a direct sign-in function for existing accounts
  const signInExisting = async () => {
    try {
      const email = prompt('Enter your email address:');
      if (!email) return;
      
      const password = prompt('Enter your password:');
      if (!password) return;
      
      setIsCreating(true);
      setMessage('Signing in...');
      
      const { user, error } = await signInUser(email, password);
      
      if (error) throw new Error(error);
      
      if (!user) {
        throw new Error('Failed to sign in');
      }
      
      setMessage('Successfully signed in! Redirecting to feed...');
      
      // Redirect to feed after a short delay
      setTimeout(() => {
        navigate('/feed');
      }, 2000);
      
    } catch (err) {
      console.error('Sign-in error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error signing in');
    } finally {
      setIsCreating(false);
    }
  };
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white rounded-lg shadow-lg p-4 w-80">
        <h3 className="font-bold mb-2 text-lg">Developer Tools</h3>
        
        {error && (
          <div className="bg-red-50 p-2 rounded mb-2 text-sm text-red-700">
            {error}
          </div>
        )}
        
        {message && (
          <div className="bg-blue-50 p-2 rounded mb-2 text-sm text-blue-700 whitespace-pre-line">
            {message}
          </div>
        )}
        
        <button 
          onClick={createTestUser}
          disabled={isCreating}
          className="btn btn-primary w-full mb-2"
        >
          {isCreating ? 'Creating...' : 'Create Test User'}
        </button>
        
        <button 
          onClick={signInExisting}
          disabled={isCreating}
          className="btn btn-secondary w-full"
        >
          Sign In (Existing Account)
        </button>
      </div>
    </div>
  );
};

export default TestUser; 