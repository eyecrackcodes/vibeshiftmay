import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useUser } from '../lib/hooks';

interface SOSButtonProps {
  className?: string;
}

/**
 * A button that users can press when they need immediate help or support
 */
const SOSButton = ({ className = '' }: SOSButtonProps) => {
  const { user, isSignedIn } = useUser();
  const [isActive, setIsActive] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const activateSOS = () => {
    setIsActive(true);
    setCountdown(5);
    setError(null);
    
    // Start countdown
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          sendSOSRequest();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const cancelSOS = () => {
    setIsActive(false);
    setCountdown(null);
    setError(null);
    setSuccess(null);
  };

  const sendSOSRequest = async () => {
    if (!isSignedIn || !user) {
      setIsActive(false);
      setError('You must be signed in to use the SOS feature');
      return;
    }

    try {
      setIsSending(true);
      
      // Record the SOS request in the database
      const { error: dbError } = await supabase
        .from('SOS_Requests')
        .insert([{
          user_id: user.id,
          status: 'active',
          location: null, // Could add location if available
          description: 'Immediate support requested',
          created_at: new Date().toISOString()
        }]);
        
      if (dbError) {
        throw dbError;
      }
      
      // Simulate sending to support team
      setTimeout(() => {
        setSuccess('Your SOS request has been sent. Someone will contact you soon.');
        setIsActive(false);
        setIsSending(false);
        
        // Reset the success message after 10 seconds
        setTimeout(() => {
          setSuccess(null);
        }, 10000);
      }, 2000);
      
    } catch (err) {
      console.error('Error sending SOS request:', err);
      setError('Failed to send SOS request. Please try again or call emergency services directly.');
      setIsActive(false);
      setIsSending(false);
    }
  };

  return (
    <div className={`sos-button ${className}`}>
      {!isActive ? (
        <>
          <button
            onClick={activateSOS}
            className="relative bg-red-600 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:bg-red-700 transition-all w-full flex items-center justify-center"
            disabled={isSending}
          >
            <span className="mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </span>
            SOS - GET HELP NOW
          </button>
          
          {error && (
            <div className="mt-2 text-red-600 text-sm text-center">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mt-2 bg-green-100 border border-green-300 text-green-700 px-4 py-2 rounded-md text-sm">
              {success}
            </div>
          )}
          
          <div className="mt-2 text-xs text-gray-500 text-center">
            Press only if you need immediate support. Help is available 24/7.
          </div>
        </>
      ) : (
        <div className="bg-red-100 border-2 border-red-600 rounded-lg p-4 text-center">
          <div className="text-xl font-bold text-red-600 mb-2">
            {countdown !== null ? `Sending SOS in ${countdown}...` : 'Sending SOS...'}
          </div>
          
          <p className="text-gray-700 mb-4">
            We're connecting you with immediate support.
          </p>
          
          {countdown !== null && (
            <button
              onClick={cancelSOS}
              className="bg-white text-red-600 font-medium py-2 px-4 rounded border border-red-300 hover:bg-red-50"
            >
              Cancel
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default SOSButton; 