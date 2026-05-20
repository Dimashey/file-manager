import { useState, useEffect } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import { useUpdateFolder } from '../hooks/useFolderActions';
import type { Folder } from '../types/folder.types';

interface Props {
  open: boolean;
  folder: Folder | null;
  onClose: () => void;
}

export function RenameFolderDialog({ open, folder, onClose }: Props) {
  const [name, setName] = useState('');
  const { mutate, isPending } = useUpdateFolder(folder?.parentId ?? undefined);

  useEffect(() => {
    if (open && folder) setName(folder.name);
  }, [open, folder]);

  const handleSubmit = () => {
    if (!folder || !name.trim()) return;
    mutate({ id: folder.id, payload: { name: name.trim() } }, { onSuccess: onClose });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Rename Folder</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus fullWidth label="New name" value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
          sx={{ mt: 1 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={isPending || !name.trim()}>
          Rename
        </Button>
      </DialogActions>
    </Dialog>
  );
}
