import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider, MutationCache, QueryCache } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { ThemeModeProvider } from './context/ThemeModeContext';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { PublicFilePage } from './pages/PublicFilePage';
import { PublicFolderPage } from './pages/PublicFolderPage';
import { AppNotifier } from './components/layout/AppNotifier';
import { notify } from './utils/notify';

function extractMessage(error: unknown): string {
  if (isAxiosError(error)) return error.response?.data?.message ?? error.message;
  if (error instanceof Error) return error.message;
  return 'Something went wrong';
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
  mutationCache: new MutationCache({
    onError: (error) => notify.error(extractMessage(error)),
  }),
  queryCache: new QueryCache({
    onError: (error) => notify.error(extractMessage(error)),
  }),
});

const router = createBrowserRouter([
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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeModeProvider>
        <AppNotifier />
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </ThemeModeProvider>
    </QueryClientProvider>
  </StrictMode>,
);
