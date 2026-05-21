import { useState } from 'react';
import {
  Box,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import type { FileItem } from '../../types/file';
import { filesApi } from '../../api/files.api';
import { useUpdateFile, useDeleteFile } from '../../hooks/useFiles';
import { getFileIcon } from '../../utils/fileIcons';
import { RenameDialog } from '../dialogs/RenameDialog';
import { ConfirmDeleteDialog } from '../dialogs/ConfirmDeleteDialog';

interface FileTreeItemProps {
  file: FileItem;
  depth: number;
}

export function FileTreeItem({ file, depth }: FileTreeItemProps) {
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [dialog, setDialog] = useState<'rename' | 'delete' | null>(null);

  const { mutate: updateFile, isPending: renaming } = useUpdateFile();
  const { mutate: deleteFile, isPending: deleting } = useDeleteFile();

  const handleClick = () => {
    filesApi.download(file.id, file.originalName);
  };

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

  return (
    <>
      <Box
        onClick={handleClick}
        sx={{
          display: 'flex',
          alignItems: 'center',
          pl: depth * 2 + 0.5,
          pr: 0.5,
          py: 0.25,
          cursor: 'pointer',
          borderRadius: 1,
          color: 'text.primary',
          '&:hover': { bgcolor: 'action.hover' },
          '&:hover .file-tree-menu-btn': { visibility: 'visible' },
        }}
      >
        {/* Spacer matching the chevron IconButton width in FolderTreeItem */}
        <Box sx={{ width: 24, height: 24, flexShrink: 0 }} />

        <Box sx={{ display: 'flex', mx: 0.5, color: 'text.secondary', fontSize: 18 }}>
          {getFileIcon(file.mimeType)}
        </Box>

        <Typography
          variant="body2"
          noWrap
          sx={{ flex: 1, fontSize: '0.8rem', color: 'text.secondary' }}
        >
          {file.name}
        </Typography>

        <Tooltip title="Options">
          <IconButton
            size="small"
            className="file-tree-menu-btn"
            onClick={handleMenuOpen}
            sx={{ p: 0.25, visibility: 'hidden' }}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleMenuClose}>
        <MenuItem
          onClick={() => {
            handleMenuClose();
            setDialog('rename');
          }}
        >
          <ListItemIcon>
            <DriveFileRenameOutlineIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Rename</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleMenuClose();
            setDialog('delete');
          }}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon sx={{ color: 'error.main' }}>
            <DeleteOutlineIcon fontSize="small" />
          </ListItemIcon>
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
    </>
  );
}
