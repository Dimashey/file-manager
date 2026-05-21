import { useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Alert, Box, Button, CircularProgress, Link, Paper, TextField, Typography } from '@mui/material';
import { useRegister } from '../hooks/useAuth';
import { getToken } from '../utils/token';

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormData = z.infer<typeof schema>;

export function RegisterPage() {
  const navigate = useNavigate();
  const { mutate: register, isPending, error } = useRegister();

  useEffect(() => {
    if (getToken()) navigate('/', { replace: true });
  }, [navigate]);

  const {
    register: rhfRegister,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = (data: FormData) => {
    register(data, { onSuccess: () => navigate('/', { replace: true }) });
  };

  const apiError = error instanceof Error ? error.message : error ? 'Registration failed' : null;

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: 'grey.100' }}>
      <Paper elevation={3} sx={{ p: 4, width: 360 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, textAlign: 'center' }}>
          Create account
        </Typography>

        {apiError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {apiError}
          </Alert>
        )}

        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          <TextField
            label="Name"
            autoComplete="name"
            autoFocus
            fullWidth
            {...rhfRegister('name')}
            error={!!errors.name}
            helperText={errors.name?.message}
          />
          <TextField
            label="Email"
            type="email"
            autoComplete="email"
            fullWidth
            {...rhfRegister('email')}
            error={!!errors.email}
            helperText={errors.email?.message}
          />
          <TextField
            label="Password"
            type="password"
            autoComplete="new-password"
            fullWidth
            {...rhfRegister('password')}
            error={!!errors.password}
            helperText={errors.password?.message}
          />
          <Button type="submit" variant="contained" fullWidth disabled={isPending} sx={{ mt: 1 }}>
            {isPending ? <CircularProgress size={22} color="inherit" /> : 'Register'}
          </Button>
        </Box>

        <Typography variant="body2" sx={{ textAlign: 'center', mt: 2 }}>
          Already have an account?{' '}
          <Link component={RouterLink} to="/register">
            Sign in
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
}
