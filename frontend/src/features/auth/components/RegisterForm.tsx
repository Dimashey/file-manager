import { useState } from 'react';
import { Box, Button, TextField, Typography, Alert } from '@mui/material';
import { Link } from '@tanstack/react-router';
import { useRegister } from '../hooks/useRegister';

export function RegisterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { mutate, isPending, isError, error } = useRegister();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate({ name, email, password });
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: 360 }}
    >
      <Typography variant="h5" fontWeight={600}>Create Account</Typography>
      {isError && (
        <Alert severity="error">
          {(error as any)?.response?.data?.message ?? 'Registration failed'}
        </Alert>
      )}
      <TextField
        label="Name"
        id="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
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
        {isPending ? 'Creating account…' : 'Register'}
      </Button>
      <Typography variant="body2" align="center">
        Have an account? <Link to="/login">Sign in</Link>
      </Typography>
    </Box>
  );
}
