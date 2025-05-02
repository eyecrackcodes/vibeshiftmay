import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../lib/auth';

const SignUp = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { user, error } = await registerUser(email, password, name);
      
      if (error) {
        setError(error);
        return;
      }
      
      if (user) {
        // Redirect to feed on successful registration
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
        <h1 className="text-2xl font-bold text-primary mb-6 text-center">Unlock Your Superpower</h1>
        <p className="text-center mb-6 text-gray-600">
          Join VibeShift and discover your hidden strengths through shared recovery stories
        </p>
        
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input w-full"
              placeholder="Your Name"
              required
            />
          </div>
          
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
          
          <div className="mb-4">
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
              minLength={8}
            />
            <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters</p>
          </div>
          
          <div className="mb-6">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input w-full"
              placeholder="••••••••"
              required
            />
          </div>
          
          <div className="bg-green-50 p-3 rounded-md mb-4 text-sm">
            <p className="text-green-700">
              <span className="font-medium">Sharing builds strength: </span>
              Your story here can inspire others on their journey to recovery
            </p>
          </div>
          
          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Creating account...' : 'Unlock Your Superpower'}
          </button>
          
          <div className="mt-4 text-center text-sm text-gray-600">
            <span>Already have an account? </span>
            <Link to="/sign-in" className="text-primary hover:underline">
              Sign in here
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

export default SignUp; 