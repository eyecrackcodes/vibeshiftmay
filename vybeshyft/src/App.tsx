import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Feed from './pages/Feed';
import Profile from './pages/Profile';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import NotFound from './pages/NotFound';
import Stories from './pages/Stories';
import StoryDetail from './pages/StoryDetail';
import { initAuth } from './lib/auth';
import { initDatabase } from './lib/supabase';
import { initStorage } from './lib/storage';
import './index.css';

function App() {
  // Initialize auth and database on app load
  useEffect(() => {
    const init = async () => {
      // First try to initialize database tables
      await initDatabase();
      
      // Initialize storage buckets
      await initStorage();
      
      // Then initialize authentication
      await initAuth();
    };
    
    init().catch(console.error);
  }, []);

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Navbar />
        
        <main className="flex-grow pt-6 pb-12">
          <Routes>
            {/* Home route redirects to Feed */}
            <Route path="/" element={<Navigate to="/feed" replace />} />
            
            {/* Public routes */}
            <Route path="/feed" element={<Feed />} />
            <Route path="/sign-in" element={<SignIn />} />
            <Route path="/sign-up" element={<SignUp />} />
            
            {/* Profile route */}
            <Route path="/profile/:id" element={<Profile />} />
            
            {/* Stories routes */}
            <Route path="/stories" element={<Stories />} />
            <Route path="/stories/:id" element={<StoryDetail />} />
            
            {/* 404 route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        
        <footer className="bg-white border-t border-gray-200 py-6">
          <div className="container mx-auto px-4 text-center text-gray-600">
            <p className="mb-2">
              VibeShift - Unlock Your Superpowers
            </p>
            <p className="text-sm">
              Built with ❤️ for those on their journey to recovery
            </p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
