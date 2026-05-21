import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Box,
  Chip,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Tooltip,
  Typography,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadIcon from '@mui/icons-material/Download';
import ShareIcon from '@mui/icons-material/Share';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import type { FileItem } from '../../types/file';
import { filesApi } from '../../api/files.api';
import { useUpdateFile, useDeleteFile, useCloneFile } from '../../hooks/useFiles';
import { getFileIcon } from '../../utils/fileIcons';
import { formatBytes } from '../../utils/formatBytes';
import { RenameDialog } from '../dialogs/RenameDialog';
import { ConfirmDeleteDialog } from '../dialogs/ConfirmDeleteDialog';
import { ShareDialog } from '../dialogs/ShareDialog';

interface FileCardProps {
  file: FileItem;
}

export function FileCard({ file }: FileCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: file.id,
  });
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [dialog, setDialog] = useState<'rename' | 'delete' | 'share' | null>(null);

  const { mutate: updateFile, isPending: renaming } = useUpdateFile();
  const { mutate: deleteFile, isPending: deleting } = useDeleteFile();
  const { mutate: cloneFile } = useCloneFile();

  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setMenuAnchor(e.currentTarget);
  };

  const handleMenuClose = () => setMenuAnchor(null);

  const handleRename = (name: string) => {
    updateFile({ id: file.id, payload: { name } }, { onSuccess: () => setDialog(null) });
  };

  const handleDelete = () => {
    deleteFile(file.id, { onSuccess: () => setDialog(null) });
  };

  const handleDownload = () => {
    filesApi.download(file.id, file.originalName);
    handleMenuClose();
  };

  return (
    <>
      <Paper
        ref={setNodeRef}
        style={{ transform: CSS.Transform.toString(transform), transition }}
        elevation={isDragging ? 6 : 1}
        sx={{
          width: 160,
          height: 128,
          p: 1.5,
          display: 'flex',
          flexDirection: 'column',
          gap: 0.5,
          cursor: isDragging ? 'grabbing' : 'default',
          opacity: isDragging ? 0.6 : 1,
          position: 'relative',
          userSelect: 'none',
          transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.2s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            bgcolor: 'background.paper',
            transform: 'translateY(-4px)',
            boxShadow: (theme) => theme.palette.mode === 'dark'
              ? '0 8px 30px rgba(0, 0, 0, 0.4)' 
              : '0 8px 30px rgba(165, 180, 203, 0.15)',
            borderColor: 'primary.main',
          },
          '&:hover .file-menu-btn': { visibility: 'visible' },
        }}
        {...attributes}
        {...listeners}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ color: 'primary.main', display: 'flex', fontSize: 32 }}>
            {getFileIcon(file.mimeType)}
          </Box>
          <Tooltip title="Options">
            <IconButton
              size="small"
              className="file-menu-btn"
              onClick={handleMenuOpen}
              sx={{ visibility: 'hidden', p: 0.25 }}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        <Typography
          variant="caption"
          noWrap
          title={file.name}
          sx={{ fontWeight: 500, lineHeight: 1.3 }}
        >
          {file.name}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 'auto' }}>
          <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.65rem' }}>
            {formatBytes(file.size)}
          </Typography>
          <Chip
            label={file.isPublic ? 'Public' : 'Private'}
            size="small"
            color={file.isPublic ? 'success' : 'default'}
            sx={{ height: 16, fontSize: '0.6rem', '& .MuiChip-label': { px: 0.75 } }}
          />
        </Box>
      </Paper>

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleMenuClose}>
        <MenuItem onClick={() => { handleMenuClose(); setDialog('rename'); }}>
          <ListItemIcon><DriveFileRenameOutlineIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Rename</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { cloneFile(file.id); handleMenuClose(); }}>
          <ListItemIcon><ContentCopyIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Clone</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDownload}>
          <ListItemIcon><DownloadIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Download</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { handleMenuClose(); setDialog('share'); }}>
          <ListItemIcon><ShareIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Share</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { handleMenuClose(); setDialog('delete'); }} sx={{ color: 'error.main' }}>
          <ListItemIcon sx={{ color: 'error.main' }}><DeleteOutlinedIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      <RenameDialog
        open={dialog === 'rename'}
        initialName={file.name}
        title="Rename file"
        isLoading={renaming}
        onSubmit={handleRename}
        onClose={() => setDialog(null)}
      />

      <ConfirmDeleteDialog
        open={dialog === 'delete'}
        title="Delete file"
        description={`Delete "${file.name}"? This cannot be undone.`}
        isLoading={deleting}
        onConfirm={handleDelete}
        onClose={() => setDialog(null)}
      />

      <ShareDialog
        open={dialog === 'share'}
        title={`Share "${file.name}"`}
        isPublicInitial={file.isPublic}
        shareUrl={`http://localhost:5174/shared/file/${file.id}`}
        isLoading={renaming}
        onToggleShare={(isPublic) => updateFile({ id: file.id, payload: { isPublic } })}
        onClose={() => setDialog(null)}
      />
    </>
  );
}
