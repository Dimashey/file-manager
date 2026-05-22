import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Link,
  Typography,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { publicFilesApi } from '../../features/files/api/files.api';
import { getFileIcon } from '../../shared/utils/fileIcons';
import { formatBytes } from '../../shared/utils/formatBytes';
import type { FileItem } from '../../entities/file';

export const PublicFilePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

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
    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: 'background.default', p: 2 }}>
      <Box sx={{ maxWidth: 420, width: '100%' }}>
        {file.folderId && (
          <Breadcrumbs sx={{ mb: 2 }}>
            <Link
              component="button"
              underline="hover"
              color="inherit"
              onClick={() => navigate(`/shared/folder/${file.folderId}`)}
            >
              Back
            </Link>
            <Typography color="text.primary">{file.name}</Typography>
          </Breadcrumbs>
        )}
        <Card sx={{ width: '100%' }}>
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
    </Box>
  );
}
