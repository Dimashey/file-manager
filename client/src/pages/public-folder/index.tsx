import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Breadcrumbs,
  CircularProgress,
  Grid,
  Link,
  Paper,
  Typography,
} from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import { publicFoldersApi } from '../../features/folders/api/folders.api';
import { publicFilesApi } from '../../features/files/api/files.api';
import { getFileIcon } from '../../shared/utils/fileIcons';
import { formatBytes } from '../../shared/utils/formatBytes';
import type { FileItem } from '../../entities/file';
import type { Folder } from '../../entities/folder';

type PublicFolderContents = {
  folder: Folder;
  subfolders: Folder[];
  files: FileItem[];
}

export const PublicFolderPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery<PublicFolderContents>({
    queryKey: ['public-folder', id],
    queryFn: () => publicFoldersApi.getContents(id!),
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

  if (isError || !data) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Typography variant="h6" color="text.secondary">
          This folder is not available or has not been shared publicly.
        </Typography>
      </Box>
    );
  }

  const { folder, subfolders, files } = data;

  return (
    <Box sx={{ maxWidth: 960, mx: 'auto', p: 3 }}>
      {folder.parentId && (
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link
            component="button"
            underline="hover"
            color="inherit"
            onClick={() => navigate(`/shared/folder/${folder.parentId}`)}
          >
            Back
          </Link>
          <Typography color="text.primary">{folder.name}</Typography>
        </Breadcrumbs>
      )}

      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
        {folder.name}
      </Typography>

      {subfolders.length === 0 && files.length === 0 && (
        <Typography color="text.secondary">This folder is empty.</Typography>
      )}

      <Grid container spacing={2}>
        {subfolders.map((sub) => (
          <Grid key={sub.id}>
            <Paper
              elevation={1}
              onClick={() => navigate(`/shared/folder/${sub.id}`)}
              sx={{
                width: 160,
                height: 128,
                p: 1.5,
                display: 'flex',
                flexDirection: 'column',
                gap: 0.5,
                cursor: 'pointer',
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <FolderIcon sx={{ fontSize: 32, color: 'warning.main' }} />
              <Typography variant="caption" noWrap title={sub.name} sx={{ fontWeight: 600 }}>
                {sub.name}
              </Typography>
              <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.65rem', mt: 'auto' }}>
                Folder
              </Typography>
            </Paper>
          </Grid>
        ))}

        {files.map((file) => (
          <Grid key={file.id}>
            <Paper
              elevation={1}
              component="a"
              href={publicFilesApi.getDownloadUrl(file.id)}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                width: 160,
                height: 128,
                p: 1.5,
                display: 'flex',
                flexDirection: 'column',
                gap: 0.5,
                cursor: 'pointer',
                textDecoration: 'none',
                color: 'inherit',
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <Box sx={{ color: 'primary.main', display: 'flex', fontSize: 32 }}>
                {getFileIcon(file.mimeType)}
              </Box>
              <Typography variant="caption" noWrap title={file.name} sx={{ fontWeight: 500 }}>
                {file.name}
              </Typography>
              <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.65rem', mt: 'auto' }}>
                {formatBytes(file.size)}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
