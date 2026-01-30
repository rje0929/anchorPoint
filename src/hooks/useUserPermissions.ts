import useAuth from './useAuth';

export function useUserPermissions() {
  const { dbUser, isVerified } = useAuth();

  return {
    canCreate: isVerified && dbUser?.role === 'ADMIN',
    canEdit: isVerified && dbUser?.role === 'ADMIN',
    canDelete: isVerified && dbUser?.role === 'ADMIN',
    canView: isVerified
  };
}

export default useUserPermissions;
