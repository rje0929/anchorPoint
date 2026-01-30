import { useNavigate } from 'react-router-dom';
import { useEffect, ReactElement } from 'react';

// project imports
import useAuth from 'hooks/useAuth';
import { UserRole } from 'types/auth';

interface RoleGuardProps {
  children: ReactElement | null;
  allowedRoles: UserRole[];
}

// ==============================|| ROLE GUARD ||============================== //

/**
 * Role guard for routes that require specific roles
 * @param {ReactElement} children children element/node
 * @param {UserRole[]} allowedRoles array of allowed roles
 */
export default function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { isLoggedIn, isVerified, dbUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login', { replace: true });
      return;
    }

    if (!isVerified) {
      navigate('/pending-verification', { replace: true });
      return;
    }

    if (dbUser && !allowedRoles.includes(dbUser.role)) {
      // Redirect non-authorized users to dashboard
      navigate('/dashboard/providers', { replace: true });
    }
  }, [isLoggedIn, isVerified, dbUser, allowedRoles, navigate]);

  // Only render children if user has required role
  if (!dbUser || !allowedRoles.includes(dbUser.role)) {
    return null;
  }

  return children;
}
