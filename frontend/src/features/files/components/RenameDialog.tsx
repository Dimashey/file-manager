import { useState, useEffect } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';

interface Props {
  open: boolean;
  currentName: string;
  onConfirm: (name: string) => void;
  onClose: () => void;
}

export function RenameDialog({ open, currentName, onConfirm, onClose }: Props) {
  const [name, setName] = useState(currentName);

  useEffect(() => { if (open) setName(currentName); }, [open, currentName]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Rename file</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus fullWidth label="Name" value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') onConfirm(name); }}
          sx={{ mt: 1 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={() => onConfirm(name)} variant="contained" disabled={!name.trim()}>
          Rename
        </Button>
      </DialogActions>
    </Dialog>
  );
}
