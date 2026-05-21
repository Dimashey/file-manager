import { useState } from 'react';
import {
  Box,
  CircularProgress,
  Collapse,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FolderIcon from '@mui/icons-material/Folder';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import type { Folder } from '../../types/folder';
import { useFolders, useUpdateFolder, useDeleteFolder, useCloneFolder } from '../../hooks/useFolders';
import { useFiles } from '../../hooks/useFiles';
import { CreateFolderDialog } from '../dialogs/CreateFolderDialog';
import { RenameDialog } from '../dialogs/RenameDialog';
import { ConfirmDeleteDialog } from '../dialogs/ConfirmDeleteDialog';
import { FileTreeItem } from './FileTreeItem';

interface FolderTreeItemProps {
  folder: Folder;
  depth: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function FolderTreeItem({ folder, depth, selectedId, onSelect }: FolderTreeItemProps) {
  const [expanded, setExpanded] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [dialog, setDialog] = useState<'create' | 'rename' | 'delete' | null>(null);

  const { data: children, isLoading: childrenLoading } = useFolders(
    expanded ? folder.id : undefined,
  );
  const { data: childFiles } = useFiles(expanded ? folder.id : undefined);
  const { mutate: updateFolder, isPending: renaming } = useUpdateFolder();
  const { mutate: deleteFolder, isPending: deleting } = useDeleteFolder();
  const { mutate: cloneFolder } = useCloneFolder();

  const isSelected = folder.id === selectedId;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded((v) => !v);
  };

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

  const handleClone = () => {
    cloneFolder(folder.id);
    handleMenuClose();
  };

  return (
    <>
      <Box
        onClick={() => onSelect(folder.id)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          pl: depth * 2 + 0.5,
          pr: 0.5,
          py: 0.25,
          cursor: 'pointer',
          borderRadius: 1,
          bgcolor: isSelected ? 'primary.light' : 'transparent',
          color: isSelected ? 'primary.contrastText' : 'text.primary',
          '&:hover': { bgcolor: isSelected ? 'primary.light' : 'action.hover' },
          '&:hover .folder-menu-btn': { visibility: 'visible' },
        }}
      >
        <IconButton size="small" onClick={handleToggle} sx={{ p: 0.25 }}>
          {childrenLoading ? (
            <CircularProgress size={14} />
          ) : expanded ? (
            <ExpandMoreIcon fontSize="small" />
          ) : (
            <ChevronRightIcon fontSize="small" />
          )}
        </IconButton>

        {expanded ? (
          <FolderOpenIcon fontSize="small" sx={{ mx: 0.5, color: 'warning.main' }} />
        ) : (
          <FolderIcon fontSize="small" sx={{ mx: 0.5, color: 'warning.main' }} />
        )}

        <Typography
          variant="body2"
          noWrap
          sx={{ flex: 1, fontWeight: isSelected ? 600 : 400, fontSize: '0.8rem' }}
        >
          {folder.name}
        </Typography>

        <Tooltip title="Options">
          <IconButton
            size="small"
            className="folder-menu-btn"
            onClick={handleMenuOpen}
            sx={{ p: 0.25, visibility: 'hidden' }}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <Collapse in={expanded} unmountOnExit>
        {children?.map((child) => (
          <FolderTreeItem
            key={child.id}
            folder={child}
            depth={depth + 1}
            selectedId={selectedId}
            onSelect={onSelect}
          />
        ))}
        {childFiles?.map((file) => (
          <FileTreeItem key={file.id} file={file} depth={depth + 1} />
        ))}
      </Collapse>

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleMenuClose}>
        <MenuItem
          onClick={() => {
            handleMenuClose();
            setDialog('create');
          }}
        >
          <ListItemIcon>
            <CreateNewFolderIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>New subfolder</ListItemText>
        </MenuItem>
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
        <MenuItem onClick={handleClone}>
          <ListItemIcon>
            <ContentCopyIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Clone</ListItemText>
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

      <CreateFolderDialog
        open={dialog === 'create'}
        parentId={folder.id}
        onClose={() => setDialog(null)}
      />

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
    </>
  );
}
