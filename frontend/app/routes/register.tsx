import { createFileRoute, redirect } from '@tanstack/react-router';
import { Box } from '@mui/material';
import { RegisterForm } from '@/features/auth/components/RegisterForm';
import { authStore } from '@/features/auth';

export const Route = createFileRoute('/register')({
  beforeLoad: () => {
    if (authStore.isAuthenticated()) throw redirect({ to: '/' });
  },
  component: () => (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <RegisterForm />
    </Box>
  ),
});
