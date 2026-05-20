import { useState } from 'react';
import {
  Box, Card, CardActions, CardContent, IconButton,
  Switch, Tooltip, Typography,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { useCloneFile, useDeleteFile, useUpdateFile } from '../hooks/useFileActions';
import { filesApi } from '../api/files.api';
import type { FileRecord } from '../types/file.types';
import { RenameDialog } from './RenameDialog';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';

interface Props {
  file: FileRecord;
  folderId?: string;
}

export function FileCard({ file, folderId }: Props) {
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const update = useUpdateFile(folderId);
  const remove = useDeleteFile(folderId);
  const clone = useCloneFile(folderId);

  const handleRename = (name: string) => {
    update.mutate({ id: file.id, payload: { name } }, { onSuccess: () => setRenameOpen(false) });
  };

  return (
    <>
      <Card variant="outlined" sx={{ width: 190 }}>
        <CardContent sx={{ pb: 0.5, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
          <InsertDriveFileIcon sx={{ fontSize: 44, color: 'text.secondary' }} />
          <Typography variant="body2" noWrap sx={{ width: '100%', textAlign: 'center' }} title={file.name}>
            {file.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {(file.size / 1024).toFixed(1)} KB
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              {file.isPublic ? 'Public' : 'Private'}
            </Typography>
            <Switch
              size="small"
              checked={file.isPublic}
              onChange={() => update.mutate({ id: file.id, payload: { isPublic: !file.isPublic } })}
            />
          </Box>
        </CardContent>
        <CardActions sx={{ justifyContent: 'center', pt: 0, pb: 1 }}>
          <Tooltip title="Download">
            <IconButton size="small" component="a" href={filesApi.downloadUrl(file.id)} download>
              <DownloadIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Rename">
            <IconButton size="small" onClick={() => setRenameOpen(true)}>
              <DriveFileRenameOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Clone">
            <IconButton size="small" onClick={() => clone.mutate(file.id)}>
              <ContentCopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" color="error" onClick={() => setDeleteOpen(true)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </CardActions>
      </Card>

      <RenameDialog
        open={renameOpen}
        currentName={file.name}
        onConfirm={handleRename}
        onClose={() => setRenameOpen(false)}
      />
      <ConfirmDialog
        open={deleteOpen}
        title="Delete file"
        message={`Delete "${file.name}"? This cannot be undone.`}
        onConfirm={() => { remove.mutate(file.id); setDeleteOpen(false); }}
        onCancel={() => setDeleteOpen(false)}
      />
    </>
  );
}
