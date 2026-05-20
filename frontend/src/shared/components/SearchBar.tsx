import { useState } from 'react';
import {
  Box, InputAdornment, List, ListItemButton, ListItemIcon,
  ListItemText, Paper, TextField, Typography,
} from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import SearchIcon from '@mui/icons-material/Search';
import { useSearchFiles } from '@/features/files/hooks/useSearchFiles';
import { useSearchFolders } from '@/features/folders/hooks/useSearchFolders';
import { useDebounce } from '@/shared/hooks/useDebounce';
import type { Folder } from '@/features/folders/types/folder.types';

interface Props {
  onSelectFolder?: (folder: Folder) => void;
}

export function SearchBar({ onSelectFolder }: Props) {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);

  const { data: files = [] } = useSearchFiles(debouncedQuery);
  const { data: folders = [] } = useSearchFolders(debouncedQuery);

  const hasResults = debouncedQuery.length > 0 && (files.length > 0 || folders.length > 0);

  const handleFolderClick = (folder: Folder) => {
    onSelectFolder?.(folder);
    setQuery('');
  };

  return (
    <Box sx={{ position: 'relative', width: 300 }}>
      <TextField
        size="small"
        placeholder="Search files and folders…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        fullWidth
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
        }}
        sx={{ bgcolor: 'rgba(255,255,255,0.15)', borderRadius: 1, input: { color: 'white' } }}
      />
      {hasResults && (
        <Paper
          elevation={4}
          sx={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 1300, maxHeight: 320, overflowY: 'auto' }}
        >
          {folders.length > 0 && (
            <>
              <Typography variant="overline" sx={{ px: 2, pt: 1, display: 'block', color: 'text.secondary' }}>
                Folders
              </Typography>
              <List dense disablePadding>
                {folders.map((folder) => (
                  <ListItemButton key={folder.id} onClick={() => handleFolderClick(folder)}>
                    <ListItemIcon sx={{ minWidth: 32 }}><FolderIcon fontSize="small" /></ListItemIcon>
                    <ListItemText primary={folder.name} />
                  </ListItemButton>
                ))}
              </List>
            </>
          )}
          {files.length > 0 && (
            <>
              <Typography variant="overline" sx={{ px: 2, pt: 1, display: 'block', color: 'text.secondary' }}>
                Files
              </Typography>
              <List dense disablePadding>
                {files.map((file) => (
                  <ListItemButton key={file.id}>
                    <ListItemIcon sx={{ minWidth: 32 }}><InsertDriveFileIcon fontSize="small" /></ListItemIcon>
                    <ListItemText
                      primary={file.name}
                      secondary={`${(file.size / 1024).toFixed(1)} KB`}
                    />
                  </ListItemButton>
                ))}
              </List>
            </>
          )}
        </Paper>
      )}
    </Box>
  );
}
