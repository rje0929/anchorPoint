import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';

// routes
import AuthenticationRoutes from './AuthenticationRoutes';
import LoginRoutes from './LoginRoutes';
import MainRoutes from './MainRoutes';
import SimpleRoutes from './SimpleRoutes';

// project imports
import Loadable from 'ui-component/Loadable';
import Login from 'views/pages/authentication/Login';

// ==============================|| ROUTING RENDER ||============================== //

const router = createBrowserRouter([{ path: '/', element: <Login /> }, AuthenticationRoutes, LoginRoutes, SimpleRoutes, MainRoutes], {
  basename: import.meta.env.VITE_APP_BASE_NAME
});

export default router;
