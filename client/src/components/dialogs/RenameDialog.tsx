import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';

const schema = z.object({ name: z.string().min(1, 'Name is required').max(255) });
type FormData = z.infer<typeof schema>;

interface RenameDialogProps {
  open: boolean;
  initialName: string;
  title?: string;
  isLoading?: boolean;
  onSubmit: (name: string) => void;
  onClose: () => void;
}

export function RenameDialog({
  open,
  initialName,
  title = 'Rename',
  isLoading,
  onSubmit,
  onClose,
}: RenameDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (open) reset({ name: initialName });
  }, [open, initialName, reset]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          fullWidth
          label="Name"
          sx={{ mt: 1 }}
          {...register('name')}
          error={!!errors.name}
          helperText={errors.name?.message}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit((d) => onSubmit(d.name))}
          variant="contained"
          disabled={isLoading}
        >
          {isLoading ? <CircularProgress size={18} color="inherit" /> : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
