import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LoginPage } from '../../pages/login';
import { RegisterPage } from '../../pages/register';
import { PublicFilePage } from '../../pages/public-file';
import { PublicFolderPage } from '../../pages/public-folder';
import { DashboardPage } from '../../pages/dashboard';
import { ProtectedRoute } from '../../features/auth/components/ProtectedRoute';

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/shared/file/:id', element: <PublicFilePage /> },
  { path: '/shared/folder/:id', element: <PublicFolderPage /> },
  {
    element: <ProtectedRoute />,
    children: [{ path: '/', element: <DashboardPage /> }],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);
