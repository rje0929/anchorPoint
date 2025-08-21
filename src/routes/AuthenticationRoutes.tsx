import { lazy } from 'react';

// project imports
import Loadable from 'ui-component/Loadable';
import MinimalLayout from 'layout/MinimalLayout';

// maintenance routing
const MaintenanceError = Loadable(lazy(() => import('views/pages/maintenance/Error')));

// landing & contact-us routing
const PagesLanding = Loadable(lazy(() => import('views/pages/landing')));

// ==============================|| AUTHENTICATION ROUTING ||============================== //

const AuthenticationRoutes = {
  path: '/',
  element: <MinimalLayout />,
  children: [
    {
      path: '/pages/error',
      element: <MaintenanceError />
    },
    {
      path: '/pages/landing',
      element: <PagesLanding />
    }
  ]
};

export default AuthenticationRoutes;
