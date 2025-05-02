import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-4xl font-bold text-primary mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-6">Page Not Found</h2>
      <p className="text-gray-600 mb-8 max-w-md mx-auto">
        The page you're looking for doesn't exist or has been moved. 
        Don't worry, your journey continues!
      </p>
      <Link 
        to="/feed" 
        className="btn btn-primary"
        aria-label="Return to feed page"
      >
        Return to Feed
      </Link>
    </div>
  );
};

export default NotFound; 