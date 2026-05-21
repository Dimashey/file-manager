import { Navigate, Outlet } from 'react-router-dom';
import { getToken } from '../../utils/token';
import { Box, CircularProgress } from '@mui/material';
import { useAuthContext } from '../../context/AuthContext';

export function ProtectedRoute() {
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
