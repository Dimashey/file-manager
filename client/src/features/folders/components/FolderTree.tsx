import { useState } from 'react';
import {
  Box,
  IconButton,
  Skeleton,
  Tooltip,
  Typography,
} from '@mui/material';
import FolderSpecialIcon from '@mui/icons-material/FolderSpecial';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import { useFolders } from '../hooks/useFolders';
import { useFiles } from '../../files/hooks/useFiles';
import { FolderTreeItem } from './FolderTreeItem';
import { FileTreeItem } from './FileTreeItem';
import { CreateFolderDialog } from './CreateFolderDialog';

type FolderTreeProps = {
  selectedFolderId: string | null;
  onSelect: (id: string | null) => void;
}

export const FolderTree = ({ selectedFolderId, onSelect }: FolderTreeProps) => {
  const { data: rootFolders, isLoading } = useFolders();
  const { data: rootFiles } = useFiles();
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 1.5,
          py: 1,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography variant="overline" sx={{ letterSpacing: 1, color: 'text.secondary', fontSize: '0.65rem' }}>
          Folders
        </Typography>
        <Tooltip title="New folder">
          <IconButton size="small" onClick={() => setCreateOpen(true)}>
            <CreateNewFolderIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <Box sx={{ flex: 1, overflowY: 'auto', py: 0.5 }}>
        <Box
          onClick={() => onSelect(null)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 1.5,
            py: 0.5,
            cursor: 'pointer',
            borderRadius: 1,
            bgcolor: selectedFolderId === null ? 'primary.light' : 'transparent',
            color: selectedFolderId === null ? 'primary.contrastText' : 'text.primary',
            '&:hover': {
              bgcolor: selectedFolderId === null ? 'primary.light' : 'action.hover',
            },
          }}
        >
          <FolderSpecialIcon fontSize="small" sx={{ color: 'primary.main' }} />
          <Typography variant="body2" sx={{ fontWeight: selectedFolderId === null ? 600 : 400, fontSize: '0.8rem' }}>
            My Drive
          </Typography>
        </Box>

        {isLoading && (
          <>
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} variant="text" sx={{ mx: 1.5, my: 0.25 }} height={28} />
            ))}
          </>
        )}

        {rootFolders?.map((folder) => (
          <FolderTreeItem
            key={folder.id}
            folder={folder}
            depth={0}
            selectedId={selectedFolderId}
            onSelect={onSelect}
          />
        ))}

        {rootFiles?.map((file) => (
          <FileTreeItem key={file.id} file={file} depth={0} />
        ))}

        {!isLoading && rootFolders?.length === 0 && rootFiles?.length === 0 && (
          <Typography variant="caption" sx={{ display: 'block', px: 2, py: 1, color: 'text.disabled' }}>
            No items yet
          </Typography>
        )}
      </Box>

      <CreateFolderDialog open={createOpen} onClose={() => setCreateOpen(false)} />
    </Box>
  );
}
