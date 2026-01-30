import { useNavigate, useLocation } from 'react-router-dom';

// project imports
import useAuth from 'hooks/useAuth';
import { GuardProps } from 'types';
import { useEffect } from 'react';

// ==============================|| AUTH GUARD ||============================== //

/**
 * Authentication guard for routes
 * @param {PropTypes.node} children children element/node
 */
export default function AuthGuard({ children }: GuardProps) {
  const { isLoggedIn, isVerified, dbUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login', { replace: true });
      return;
    }

    // If logged in but dbUser exists and is not verified, redirect to pending verification
    // Skip if already on pending-verification page
    if (dbUser && !isVerified && location.pathname !== '/pending-verification') {
      navigate('/pending-verification', { replace: true });
    }
  }, [isLoggedIn, isVerified, dbUser, navigate, location.pathname]);

  return children;
}
