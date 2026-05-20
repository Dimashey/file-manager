import { useState } from 'react';
import {
  Box, CircularProgress, Divider, IconButton, List,
  ListItemButton, ListItemIcon, ListItemText, Tooltip, Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import FolderIcon from '@mui/icons-material/Folder';
import { useFolders } from '../hooks/useFolders';
import { useDeleteFolder, useCloneFolder } from '../hooks/useFolderActions';
import type { Folder } from '../types/folder.types';
import { CreateFolderDialog } from './CreateFolderDialog';
import { RenameFolderDialog } from './RenameFolderDialog';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';

interface Props {
  selectedId?: string;
  onSelect: (folder: Folder) => void;
}

export function FolderTree({ selectedId, onSelect }: Props) {
  const { data: folders = [], isLoading } = useFolders();
  const [createOpen, setCreateOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState<Folder | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Folder | null>(null);
  const deleteFolder = useDeleteFolder();
  const cloneFolder = useCloneFolder();

  if (isLoading) return <CircularProgress size={20} sx={{ m: 2 }} />;

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', px: 1, pb: 0.5 }}>
        <Typography variant="overline" sx={{ flex: 1, color: 'text.secondary', fontSize: 11 }}>
          Folders
        </Typography>
        <Tooltip title="New folder">
          <IconButton size="small" onClick={() => setCreateOpen(true)}>
            <AddIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
      <Divider />
      <List dense disablePadding>
        {folders.map((folder) => (
          <ListItemButton
            key={folder.id}
            selected={selectedId === folder.id}
            onClick={() => onSelect(folder)}
            sx={{ pr: 1 }}
          >
            <ListItemIcon sx={{ minWidth: 32 }}>
              <FolderIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={folder.name} primaryTypographyProps={{ noWrap: true }} />
            <Box sx={{ display: 'flex', gap: 0.25 }}>
              <Tooltip title="Rename">
                <IconButton size="small" onClick={(e) => { e.stopPropagation(); setRenameTarget(folder); }}>
                  <DriveFileRenameOutlineIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Clone">
                <IconButton size="small" onClick={(e) => { e.stopPropagation(); cloneFolder.mutate(folder.id); }}>
                  <ContentCopyIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete">
                <IconButton size="small" onClick={(e) => { e.stopPropagation(); setDeleteTarget(folder); }}>
                  <DeleteIcon sx={{ fontSize: 14 }} color="error" />
                </IconButton>
              </Tooltip>
            </Box>
          </ListItemButton>
        ))}
      </List>

      <CreateFolderDialog open={createOpen} onClose={() => setCreateOpen(false)} />
      <RenameFolderDialog open={Boolean(renameTarget)} folder={renameTarget} onClose={() => setRenameTarget(null)} />
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete folder"
        message={`Delete "${deleteTarget?.name}"? All contents will be lost.`}
        onConfirm={() => { deleteFolder.mutate(deleteTarget!.id); setDeleteTarget(null); }}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
