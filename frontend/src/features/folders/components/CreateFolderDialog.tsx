import { useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import { useCreateFolder } from '../hooks/useFolderActions';

interface Props {
  open: boolean;
  parentId?: string;
  onClose: () => void;
}

export function CreateFolderDialog({ open, parentId, onClose }: Props) {
  const [name, setName] = useState('');
  const { mutate, isPending } = useCreateFolder(parentId);

  const handleSubmit = () => {
    if (!name.trim()) return;
    mutate({ name: name.trim(), parentId }, {
      onSuccess: () => { setName(''); onClose(); },
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>New Folder</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus fullWidth label="Folder name" value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
          sx={{ mt: 1 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={isPending || !name.trim()}>
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}
