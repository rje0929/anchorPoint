import { lazy } from 'react';

// project imports
import MinimalLayout from 'layout/MinimalLayout';
import Loadable from 'ui-component/Loadable';

// lazy load
const PendingVerification = Loadable(lazy(() => import('views/pages/authentication/PendingVerification')));

// ==============================|| SIMPLE ROUTING ||============================== //

const SimpleRoutes = {
  path: '/',
  element: <MinimalLayout />,
  children: [
    {
      path: '/pending-verification',
      element: <PendingVerification />
    }
  ]
};

export default SimpleRoutes;
