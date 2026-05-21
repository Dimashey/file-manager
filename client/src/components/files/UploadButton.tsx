import { useRef, useState } from 'react';
import { Box, CircularProgress, Fab, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useUploadFile } from '../../hooks/useFiles';

interface UploadButtonProps {
  folderId: string | null;
}

export function UploadButton({ folderId }: UploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { mutateAsync: uploadFile } = useUploadFile();

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    if (selected.length === 0) return;
    setIsUploading(true);
    try {
      await Promise.all(selected.map((f) => uploadFile({ file: f, folderId })));
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        multiple
        style={{ display: 'none' }}
        onChange={handleFiles}
      />
      <Tooltip title="Upload files">
        <Box sx={{ position: 'fixed', bottom: 32, right: 32 }}>
          <Fab
            color="primary"
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
            sx={{ position: 'relative' }}
          >
            {isUploading ? <CircularProgress size={24} color="inherit" /> : <AddIcon />}
          </Fab>
        </Box>
      </Tooltip>
    </>
  );
}
