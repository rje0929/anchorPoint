// project imports
import MainLayout from 'layout/MainLayout';
import AuthGuard from 'utils/route-guard/AuthGuard';
import RoleGuard from 'utils/route-guard/RoleGuard';
import Providers from 'views/dashboard/providers';
import ProviderMap from 'views/dashboard/providers/ProviderMap';
import UserManagement from 'views/admin/UserManagement';

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/',
  element: (
    <AuthGuard>
      <MainLayout />
    </AuthGuard>
  ),
  children: [
    {
      path: '/dashboard/providers',
      element: <Providers />
    },
    {
      path: '/dashboard/provider-map',
      element: <ProviderMap />
    },
    {
      path: '/admin/users',
      element: (
        <RoleGuard allowedRoles={['ADMIN']}>
          <UserManagement />
        </RoleGuard>
      )
    }
  ]
};

export default MainRoutes;
