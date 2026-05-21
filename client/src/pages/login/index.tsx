import { useEffect } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Link,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import AcUnitIcon from '@mui/icons-material/AcUnit';
import { useLogin } from "../../features/auth/hooks/useAuth";
import { getToken } from "../../shared/utils/token";
import nordicBg from '../../assets/nordic_bg.png';

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormData = z.infer<typeof schema>;

export const LoginPage = () => {
  const navigate = useNavigate();
  const { mutate: login, isPending, error } = useLogin();

  useEffect(() => {
    if (getToken()) navigate("/", { replace: true });
  }, [navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = (data: FormData) => {
    login(data, { onSuccess: () => navigate("/", { replace: true }) });
  };

  const apiError =
    error instanceof Error
      ? error.message
      : error
        ? "Invalid credentials"
        : null;

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
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
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
            FjordDrive
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', fontWeight: 600, mt: 0.5 }}
          >
            Elegant Nordic File Storage
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
          sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}
        >
          <TextField
            label="Email"
            type="email"
            autoComplete="email"
            autoFocus
            fullWidth
            {...register("email")}
            error={!!errors.email}
            helperText={errors.email?.message}
            slotProps={{
              inputLabel: { shrink: true }
            }}
          />
          <TextField
            label="Password"
            type="password"
            autoComplete="current-password"
            fullWidth
            {...register("password")}
            error={!!errors.password}
            helperText={errors.password?.message}
            slotProps={{
              inputLabel: { shrink: true }
            }}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={isPending}
            sx={{ mt: 1, py: 1.25 }}
          >
            {isPending ? (
              <CircularProgress size={22} color="inherit" />
            ) : (
              "Sign in"
            )}
          </Button>
        </Box>

        <Typography variant="body2" sx={{ textAlign: "center", mt: 3, color: 'text.secondary' }}>
          Don't have an account?{" "}
          <Link component={RouterLink} to="/register" sx={{ fontWeight: 600, textDecoration: 'none' }}>
            Register
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
}
