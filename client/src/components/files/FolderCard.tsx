import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Box,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Tooltip,
  Typography,
} from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import ShareIcon from '@mui/icons-material/Share';
import type { Folder } from '../../types/folder';
import { useUpdateFolder, useDeleteFolder, useCloneFolder } from '../../hooks/useFolders';
import { RenameDialog } from '../dialogs/RenameDialog';
import { ConfirmDeleteDialog } from '../dialogs/ConfirmDeleteDialog';
import { ShareDialog } from '../dialogs/ShareDialog';

interface FolderCardProps {
  folder: Folder;
  onNavigate: (folder: { id: string; name: string }) => void;
}

export function FolderCard({ folder, onNavigate }: FolderCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: folder.id,
  });
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [dialog, setDialog] = useState<'rename' | 'delete' | 'share' | null>(null);

  const { mutate: updateFolder, isPending: renaming } = useUpdateFolder();
  const { mutate: deleteFolder, isPending: deleting } = useDeleteFolder();
  const { mutate: cloneFolder } = useCloneFolder();

  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setMenuAnchor(e.currentTarget);
  };

  const handleMenuClose = () => setMenuAnchor(null);

  const handleRename = (name: string) => {
    updateFolder({ id: folder.id, payload: { name } }, { onSuccess: () => setDialog(null) });
  };

  const handleDelete = () => {
    deleteFolder(folder.id, { onSuccess: () => setDialog(null) });
  };

  return (
    <>
      <Paper
        ref={setNodeRef}
        style={{ transform: CSS.Transform.toString(transform), transition }}
        elevation={isDragging ? 6 : 1}
        onClick={() => { if (!isDragging) onNavigate({ id: folder.id, name: folder.name }); }}
        sx={{
          width: 160,
          height: 128,
          p: 1.5,
          display: 'flex',
          flexDirection: 'column',
          gap: 0.5,
          cursor: isDragging ? 'grabbing' : 'pointer',
          opacity: isDragging ? 0.6 : 1,
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
          '&:hover .folder-card-menu-btn': { visibility: 'visible' },
        }}
        {...attributes}
        {...listeners}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <FolderIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <Tooltip title="Options">
            <IconButton
              size="small"
              className="folder-card-menu-btn"
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
          title={folder.name}
          sx={{ fontWeight: 600, lineHeight: 1.3 }}
        >
          {folder.name}
        </Typography>

        <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.65rem', mt: 'auto' }}>
          Folder
        </Typography>
      </Paper>

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleMenuClose}>
        <MenuItem onClick={() => { handleMenuClose(); setDialog('rename'); }}>
          <ListItemIcon><DriveFileRenameOutlineIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Rename</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { cloneFolder(folder.id); handleMenuClose(); }}>
          <ListItemIcon><ContentCopyIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Clone</ListItemText>
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
        initialName={folder.name}
        title="Rename folder"
        isLoading={renaming}
        onSubmit={handleRename}
        onClose={() => setDialog(null)}
      />

      <ConfirmDeleteDialog
        open={dialog === 'delete'}
        title="Delete folder"
        description={`Delete "${folder.name}" and all its contents? This cannot be undone.`}
        isLoading={deleting}
        onConfirm={handleDelete}
        onClose={() => setDialog(null)}
      />

      <ShareDialog
        open={dialog === 'share'}
        title={`Share "${folder.name}"`}
        isPublicInitial={folder.isPublic}
        shareUrl={`http://localhost:5174/shared/folder/${folder.id}`}
        isLoading={renaming}
        onToggleShare={(isPublic) => updateFolder({ id: folder.id, payload: { isPublic } })}
        onClose={() => setDialog(null)}
      />
    </>
  );
}
