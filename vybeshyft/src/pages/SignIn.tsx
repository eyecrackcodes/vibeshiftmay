import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInUser } from '../lib/auth';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { user, error } = await signInUser(email, password);
      
      if (error) {
        setError(error);
        return;
      }
      
      if (user) {
        // Redirect to feed on successful login
        navigate('/feed');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <div className="card">
        <h1 className="text-2xl font-bold text-primary mb-6 text-center">Sign In to VibeShift</h1>
        
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input w-full"
              placeholder="your@email.com"
              required
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input w-full"
              placeholder="••••••••"
              required
            />
          </div>
          
          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
          
          <div className="mt-4 text-center text-sm text-gray-600">
            <span>Don't have an account? </span>
            <Link to="/sign-up" className="text-primary hover:underline">
              Sign up here
            </Link>
          </div>
        </form>
      </div>
      
      <div className="mt-8 text-center">
        <Link to="/feed" className="text-gray-500 hover:underline text-sm">
          Return to Feed
        </Link>
      </div>
    </div>
  );
};

export default SignIn; 