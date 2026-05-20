import { useRef } from 'react';
import { Box, Button, LinearProgress } from '@mui/material';
import UploadIcon from '@mui/icons-material/Upload';
import { useUploadFile } from '../hooks/useFileActions';

interface Props {
  folderId?: string;
}

export function UploadButton({ folderId }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { mutate, isPending } = useUploadFile(folderId);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) mutate(file);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <Box>
      <input ref={inputRef} type="file" style={{ display: 'none' }} onChange={handleChange} />
      <Button
        variant="contained"
        startIcon={<UploadIcon />}
        onClick={() => inputRef.current?.click()}
        disabled={isPending}
      >
        {isPending ? 'Uploading…' : 'Upload'}
      </Button>
      {isPending && <LinearProgress sx={{ mt: 0.5 }} />}
    </Box>
  );
}
