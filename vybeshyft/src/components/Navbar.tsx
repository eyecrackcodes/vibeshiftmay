import { Link } from 'react-router-dom';
import { useUser, useClerk } from '../lib/hooks';

const Navbar = () => {
  const { signOut } = useClerk();
  const { isSignedIn, user } = useUser();

  const handleSignOut = () => {
    signOut();
  };

  return (
    <nav className="sticky top-0 z-10 bg-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-primary">VibeShift</span>
              <div className="w-2 h-2 mx-2 bg-secondary rounded-full"></div>
              <span className="text-sm text-gray-500 hidden sm:inline-block">Unlock Your Superpowers</span>
            </div>
          </Link>

          <div className="flex items-center gap-6">
            {isSignedIn ? (
              <>
                <Link 
                  to="/feed" 
                  className="text-gray-600 hover:text-primary transition-colors"
                  aria-label="Go to feed page"
                >
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1M19 20a2 2 0 002-2V8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2h8z" />
                    </svg>
                    <span>Feed</span>
                  </div>
                </Link>
                <Link 
                  to={`/profile/${user?.id}`} 
                  className="text-gray-600 hover:text-primary transition-colors"
                  aria-label="Go to your profile page"
                >
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>Profile</span>
                  </div>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="btn btn-primary flex items-center"
                  aria-label="Sign out"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/sign-in" 
                  className="text-gray-600 hover:text-primary transition-colors"
                  aria-label="Sign in to your account"
                >
                  Sign In
                </Link>
                <Link 
                  to="/sign-up" 
                  className="btn btn-primary"
                  aria-label="Create a new account"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 