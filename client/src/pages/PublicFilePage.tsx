import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Typography,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { publicFilesApi } from '../api/files.api';
import { getFileIcon } from '../utils/fileIcons';
import { formatBytes } from '../utils/formatBytes';
import type { FileItem } from '../types/file';

export function PublicFilePage() {
  const { id } = useParams<{ id: string }>();

  const { data: file, isLoading, isError } = useQuery<FileItem>({
    queryKey: ['public-file', id],
    queryFn: () => publicFilesApi.getMetadata(id!),
    enabled: !!id,
    retry: false,
  });

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !file) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Typography variant="h6" color="text.secondary">
          This file is not available or has not been shared publicly.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: 'background.default', p: 2 }}>
      <Card sx={{ maxWidth: 420, width: '100%' }}>
        <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 4 }}>
          <Box sx={{ color: 'primary.main', fontSize: 64, display: 'flex' }}>
            {getFileIcon(file.mimeType)}
          </Box>
          <Typography variant="h6" align="center" sx={{ wordBreak: 'break-word' }}>
            {file.originalName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {formatBytes(file.size)}
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<DownloadIcon />}
            href={publicFilesApi.getDownloadUrl(file.id)}
            target="_blank"
            rel="noopener noreferrer"
          >
            Download
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}
