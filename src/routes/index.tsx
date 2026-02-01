import { createBrowserRouter } from 'react-router-dom';

// routes
import AuthenticationRoutes from './AuthenticationRoutes';
import LoginRoutes, { PasswordResetRoutes } from './LoginRoutes';
import MainRoutes from './MainRoutes';
import SimpleRoutes from './SimpleRoutes';

// project imports
import Login from 'views/pages/authentication/Login';

// ==============================|| ROUTING RENDER ||============================== //

const router = createBrowserRouter(
  [{ path: '/', element: <Login /> }, AuthenticationRoutes, LoginRoutes, PasswordResetRoutes, SimpleRoutes, MainRoutes],
  {
    basename: import.meta.env.VITE_APP_BASE_NAME
  }
);

export default router;
