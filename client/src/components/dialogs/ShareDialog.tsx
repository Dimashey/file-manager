import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { notify } from '../../utils/notify';

interface ShareDialogProps {
  open: boolean;
  title: string;
  isPublicInitial: boolean;
  shareUrl: string;
  isLoading: boolean;
  onToggleShare: (isPublic: boolean) => void;
  onClose: () => void;
}

export function ShareDialog({
  open,
  title,
  isPublicInitial,
  shareUrl,
  isLoading,
  onToggleShare,
  onClose,
}: ShareDialogProps) {
  const [isPublic, setIsPublic] = useState(isPublicInitial);

  useEffect(() => {
    setIsPublic(isPublicInitial);
  }, [isPublicInitial]);

  const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setIsPublic(checked);
    onToggleShare(checked);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl).then(
      () => notify.success('Sharing link copied to clipboard!'),
      () => notify.error('Failed to copy link. Please select and copy manually.'),
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Box sx={{ py: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControlLabel
            control={<Switch checked={isPublic} onChange={handleToggle} disabled={isLoading} />}
            label="Enable Public Link Sharing"
          />
          {isPublic && (
            <>
              <Typography variant="body2" color="text.secondary">
                Anyone with this link can view and download the shared items:
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                value={shareUrl}
                slotProps={{
                  input: {
                    readOnly: true,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={handleCopy} edge="end" title="Copy to clipboard">
                          <ContentCopyIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
