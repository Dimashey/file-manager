import { useRef, useState } from 'react';
import {
  Box,
  CircularProgress,
  ClickAwayListener,
  Divider,
  InputBase,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Popper,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FolderIcon from '@mui/icons-material/Folder';
import { useSearch } from '../hooks/useSearch';
import { filesApi } from '../../files/api/files.api';
import { getFileIcon } from '../../../shared/utils/fileIcons';
import type { FileItem } from '../../../entities/file';
import type { Folder } from '../../../entities/folder';

type SearchBarProps = {
  onFolderNavigate: (folder: { id: string; name: string }) => void;
}

export const SearchBar = ({ onFolderNavigate }: SearchBarProps) => {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);

  const { files, folders, isLoading, hasQuery } = useSearch(query);

  const hasResults = folders.length > 0 || files.length > 0;
  const showDropdown = open && hasQuery;

  const handleFolderClick = (folder: Folder) => {
    onFolderNavigate({ id: folder.id, name: folder.name });
    setQuery('');
    setOpen(false);
  };

  const handleFileClick = (file: FileItem) => {
    filesApi.download(file.id, file.originalName);
    setOpen(false);
  };

  return (
    <ClickAwayListener onClickAway={() => setOpen(false)}>
      <Box sx={{ position: 'relative', flex: 1, maxWidth: 480, mx: 2 }}>
        <Box
          ref={anchorRef}
          sx={{
            display: 'flex',
            alignItems: 'center',
            bgcolor: 'action.hover',
            borderRadius: 2,
            px: 1.5,
            py: 0.5,
            border: '1px solid',
            borderColor: open ? 'primary.main' : 'transparent',
            transition: 'border-color 0.15s',
          }}
        >
          <SearchIcon fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />
          <InputBase
            placeholder="Search files and folders…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            sx={{ flex: 1, fontSize: '0.875rem' }}
          />
          {isLoading && <CircularProgress size={14} sx={{ ml: 1 }} />}
        </Box>

        <Popper
          open={showDropdown}
          anchorEl={anchorRef.current}
          placement="bottom-start"
          sx={{ width: anchorRef.current?.offsetWidth, zIndex: 1300 }}
        >
          <Paper elevation={4} sx={{ mt: 0.5, maxHeight: 400, overflowY: 'auto' }}>
            {!hasResults && !isLoading && (
              <Typography variant="body2" sx={{ px: 2, py: 1.5, color: 'text.secondary' }}>
                No results for "{query}"
              </Typography>
            )}

            {folders.length > 0 && (
              <>
                <Typography
                  variant="overline"
                  sx={{ px: 2, pt: 1, display: 'block', color: 'text.secondary', fontSize: '0.65rem' }}
                >
                  Folders
                </Typography>
                <List dense disablePadding>
                  {folders.map((folder) => (
                    <ListItemButton key={folder.id} onClick={() => handleFolderClick(folder)}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <FolderIcon fontSize="small" sx={{ color: 'warning.main' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={folder.name}
                        slotProps={{ primary: { variant: 'body2', noWrap: true } as object }}
                      />
                    </ListItemButton>
                  ))}
                </List>
              </>
            )}

            {folders.length > 0 && files.length > 0 && <Divider />}

            {files.length > 0 && (
              <>
                <Typography
                  variant="overline"
                  sx={{ px: 2, pt: 1, display: 'block', color: 'text.secondary', fontSize: '0.65rem' }}
                >
                  Files
                </Typography>
                <List dense disablePadding>
                  {files.map((file) => (
                    <ListItemButton key={file.id} onClick={() => handleFileClick(file)}>
                      <ListItemIcon sx={{ minWidth: 32, fontSize: 18, color: 'text.secondary' }}>
                        {getFileIcon(file.mimeType)}
                      </ListItemIcon>
                      <ListItemText
                        primary={file.name}
                        slotProps={{ primary: { variant: 'body2', noWrap: true } as object }}
                      />
                    </ListItemButton>
                  ))}
                </List>
              </>
            )}
          </Paper>
        </Popper>
      </Box>
    </ClickAwayListener>
  );
}
