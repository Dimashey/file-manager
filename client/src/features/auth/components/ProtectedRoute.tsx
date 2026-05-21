import { Navigate, Outlet } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { getToken } from '../../../shared/utils/token';
import { useAuthContext } from '../../../app/providers/AuthProvider';

export const ProtectedRoute = () => {
  const { isLoading } = useAuthContext();

  if (!getToken()) return <Navigate to="/login" replace />;

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return <Outlet />;
}
