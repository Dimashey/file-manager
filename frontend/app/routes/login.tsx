import { createFileRoute, redirect } from '@tanstack/react-router';
import { Box } from '@mui/material';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { authStore } from '@/features/auth';

export const Route = createFileRoute('/login')({
  beforeLoad: () => {
    if (authStore.isAuthenticated()) throw redirect({ to: '/' });
  },
  component: () => (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <LoginForm />
    </Box>
  ),
});
