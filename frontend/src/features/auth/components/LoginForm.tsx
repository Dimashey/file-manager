import { useState } from 'react';
import { Box, Button, TextField, Typography, Alert } from '@mui/material';
import { Link } from '@tanstack/react-router';
import { useLogin } from '../hooks/useLogin';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { mutate, isPending, isError, error } = useLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate({ email, password });
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: 360 }}
    >
      <Typography variant="h5" fontWeight={600}>Sign In</Typography>
      {isError && (
        <Alert severity="error">
          {(error as any)?.response?.data?.message ?? 'Login failed'}
        </Alert>
      )}
      <TextField
        label="Email"
        id="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <TextField
        label="Password"
        id="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <Button type="submit" variant="contained" disabled={isPending}>
        {isPending ? 'Signing in…' : 'Sign In'}
      </Button>
      <Typography variant="body2" align="center">
        No account? <Link to="/register">Register</Link>
      </Typography>
    </Box>
  );
}
