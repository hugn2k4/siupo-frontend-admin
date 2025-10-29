import { lazy } from 'react';

// project imports
import MinimalLayout from 'layout/MinimalLayout';
import Loadable from 'ui-component/Loadable';
import PublicRoute from './PublicRoute';

// maintenance routing
const LoginPage = Loadable(lazy(() => import('views/pages/authentication/Login')));
const RegisterPage = Loadable(lazy(() => import('views/pages/authentication/Register')));

// ==============================|| AUTHENTICATION ROUTING ||============================== //

const AuthenticationRoutes = {
  path: '/',
  element: <MinimalLayout />,
  children: [
    {
      path: '/pages/login',
      element: (
        <PublicRoute>
          <LoginPage />
        </PublicRoute>
      )
    },
    {
      path: '/pages/register',
      element: (
        <PublicRoute>
          <RegisterPage />
        </PublicRoute>
      )
    }
  ]
};

export default AuthenticationRoutes;
