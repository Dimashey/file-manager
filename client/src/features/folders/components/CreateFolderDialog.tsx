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
import { useCreateFolder } from '../hooks/useFolders';

const schema = z.object({ name: z.string().min(1, 'Name is required').max(255) });
type FormData = z.infer<typeof schema>;

type CreateFolderDialogProps = {
  open: boolean;
  parentId?: string;
  onClose: () => void;
}

export const CreateFolderDialog = ({ open, parentId, onClose }: CreateFolderDialogProps) => {
  const { mutate: createFolder, isPending } = useCreateFolder();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (open) reset({ name: '' });
  }, [open, reset]);

  const onSubmit = (data: FormData) => {
    createFolder({ name: data.name, parentId }, { onSuccess: onClose });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>New Folder</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          fullWidth
          label="Folder name"
          sx={{ mt: 1 }}
          {...register('name')}
          error={!!errors.name}
          helperText={errors.name?.message}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isPending}>
          Cancel
        </Button>
        <Button onClick={handleSubmit(onSubmit)} variant="contained" disabled={isPending}>
          {isPending ? <CircularProgress size={18} color="inherit" /> : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
