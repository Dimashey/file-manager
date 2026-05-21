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
import { useLogin } from "../hooks/useAuth";
import { getToken } from "../utils/token";

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password must be at least 6 characters"),
});

type FormData = z.infer<typeof schema>;

export function LoginPage() {
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
        bgcolor: "grey.100",
      }}
    >
      <Paper elevation={3} sx={{ p: 4, width: 360 }}>
        <Typography
          variant="h5"
          sx={{ fontWeight: 700, mb: 3, textAlign: "center" }}
        >
          Sign in
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
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
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
          />
          <TextField
            label="Password"
            type="password"
            autoComplete="current-password"
            fullWidth
            {...register("password")}
            error={!!errors.password}
            helperText={errors.password?.message}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={isPending}
            sx={{ mt: 1 }}
          >
            {isPending ? (
              <CircularProgress size={22} color="inherit" />
            ) : (
              "Sign in"
            )}
          </Button>
        </Box>

        <Typography variant="body2" sx={{ textAlign: "center", mt: 2 }}>
          No account?{" "}
          <Link component={RouterLink} to="/register">
            Register
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
}
