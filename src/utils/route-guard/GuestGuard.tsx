import { useNavigate } from 'react-router-dom';

// project imports
import useAuth from 'hooks/useAuth';
import { DASHBOARD_PATH } from 'config';
import { GuardProps } from 'types';
import { useEffect } from 'react';

// ==============================|| GUEST GUARD ||============================== //

/**
 * Guest guard for routes having no auth required
 * @param {PropTypes.node} children children element/node
 */

export default function GuestGuard({ children }: GuardProps) {
  const { isLoggedIn, isVerified, dbUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn) {
      // Wait for dbUser to be loaded before deciding where to redirect
      if (dbUser) {
        if (isVerified) {
          // User is verified, go to dashboard
          navigate(DASHBOARD_PATH, { replace: true });
        } else {
          // User is logged in but not verified, go to pending verification
          navigate('/pending-verification', { replace: true });
        }
      }
      // If dbUser hasn't loaded yet, don't redirect - wait for it
    }
  }, [isLoggedIn, isVerified, dbUser, navigate]);

  return children;
}
