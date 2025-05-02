import { useNavigate } from 'react-router-dom';

interface SignInButtonProps {
  mode: 'signin' | 'signup';
  className?: string;
}

const SignInButton = ({ mode, className = 'btn btn-primary' }: SignInButtonProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (mode === 'signin') {
      navigate('/sign-in');
    } else {
      navigate('/sign-up');
    }
  };

  return (
    <button
      onClick={handleClick}
      className={className}
      aria-label={mode === 'signin' ? 'Sign in to your account' : 'Create a new account'}
    >
      {mode === 'signin' ? 'Sign In' : 'Unlock Your Superpower'}
    </button>
  );
};

export default SignInButton; 