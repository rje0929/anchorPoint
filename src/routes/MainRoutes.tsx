// project imports
import MainLayout from 'layout/MainLayout';
import AuthGuard from 'utils/route-guard/AuthGuard';
import Providers from 'views/dashboard/providers';
import ProviderMap from 'views/dashboard/providers/ProviderMap';

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
    }
  ]
};

export default MainRoutes;
