import { useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Alert, Box, Button, CircularProgress, Link, Paper, TextField, Typography } from '@mui/material';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import { useRegister } from '../../features/auth/hooks/useAuth';
import { getToken } from '../../shared/utils/token';
import nordicBg from '../../assets/nordic_bg.png';

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormData = z.infer<typeof schema>;

export const RegisterPage = () => {
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
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundImage: `linear-gradient(rgba(46, 52, 64, 0.15), rgba(46, 52, 64, 0.35)), url(${nordicBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        p: 2,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 4.5,
          width: 380,
          borderRadius: 4,
          border: '1px solid',
          borderColor: (theme) => theme.palette.mode === 'dark'
            ? 'rgba(255, 255, 255, 0.08)'
            : 'rgba(255, 255, 255, 0.45)',
          background: (theme) => theme.palette.mode === 'dark'
            ? 'rgba(46, 52, 64, 0.82)'
            : 'rgba(255, 255, 255, 0.82)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          boxShadow: (theme) => theme.palette.mode === 'dark'
            ? '0 12px 40px 0 rgba(0, 0, 0, 0.5)'
            : '0 12px 40px 0 rgba(46, 52, 64, 0.15)',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3.5 }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 3,
              bgcolor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: (theme) => theme.palette.mode === 'dark'
                ? '0 6px 20px 0 rgba(136, 192, 208, 0.3)'
                : '0 6px 20px 0 rgba(94, 129, 172, 0.3)',
              mb: 1.5
            }}
          >
            <AcUnitIcon sx={{ fontSize: 32, color: 'primary.contrastText' }} />
          </Box>
          <Typography
            variant="h5"
            sx={{ fontWeight: 800, letterSpacing: '-0.02em', color: 'text.primary', textAlign: "center" }}
          >
            Create account
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', fontWeight: 600, mt: 0.5 }}
          >
            Join FjordDrive cloud storage
          </Typography>
        </Box>

        {apiError && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {apiError}
          </Alert>
        )}

        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}
        >
          <TextField
            label="Name"
            autoComplete="name"
            autoFocus
            fullWidth
            {...rhfRegister('name')}
            error={!!errors.name}
            helperText={errors.name?.message}
            slotProps={{
              inputLabel: { shrink: true }
            }}
          />
          <TextField
            label="Email"
            type="email"
            autoComplete="email"
            fullWidth
            {...rhfRegister('email')}
            error={!!errors.email}
            helperText={errors.email?.message}
            slotProps={{
              inputLabel: { shrink: true }
            }}
          />
          <TextField
            label="Password"
            type="password"
            autoComplete="new-password"
            fullWidth
            {...rhfRegister('password')}
            error={!!errors.password}
            helperText={errors.password?.message}
            slotProps={{
              inputLabel: { shrink: true }
            }}
          />
          <Button type="submit" variant="contained" fullWidth disabled={isPending} sx={{ mt: 1, py: 1.25 }}>
            {isPending ? <CircularProgress size={22} color="inherit" /> : 'Register'}
          </Button>
        </Box>

        <Typography variant="body2" sx={{ textAlign: "center", mt: 3, color: 'text.secondary' }}>
          Already have an account?{' '}
          <Link component={RouterLink} to="/login" sx={{ fontWeight: 600, textDecoration: 'none' }}>
            Sign in
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
}
