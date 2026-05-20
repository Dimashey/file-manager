import { useState } from 'react';
import { createFileRoute, redirect } from '@tanstack/react-router';
import {
  AppBar, Box, Button, Divider, Drawer,
  IconButton, Toolbar, Tooltip, Typography,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { authStore, useCurrentUser } from '@/features/auth';
import { FolderTree } from '@/features/folders/components/FolderTree';
import { FileList } from '@/features/files/components/FileList';
import { UploadButton } from '@/features/files/components/UploadButton';
import { SearchBar } from '@/shared/components/SearchBar';
import type { Folder } from '@/features/folders/types/folder.types';

const DRAWER_WIDTH = 260;

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    if (!authStore.isAuthenticated()) throw redirect({ to: '/login' });
  },
  component: Dashboard,
});

function Dashboard() {
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const { data: user } = useCurrentUser();

  const handleLogout = () => {
    authStore.clearToken();
    window.location.href = '/login';
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
        <Toolbar sx={{ gap: 2 }}>
          <Typography variant="h6" sx={{ flexShrink: 0 }}>File Manager</Typography>
          <Box sx={{ flex: 1 }} />
          <SearchBar onSelectFolder={(folder) => setSelectedFolder(folder)} />
          {user && (
            <Typography variant="body2" sx={{ ml: 1 }}>{user.name}</Typography>
          )}
          <Tooltip title="Logout">
            <IconButton color="inherit" onClick={handleLogout}>
              <LogoutIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto', p: 1 }}>
          <Button
            fullWidth
            variant={selectedFolder === null ? 'contained' : 'text'}
            size="small"
            onClick={() => setSelectedFolder(null)}
            sx={{ mb: 1 }}
          >
            All Files
          </Button>
          <Divider sx={{ mb: 1 }} />
          <FolderTree selectedId={selectedFolder?.id} onSelect={setSelectedFolder} />
        </Box>
      </Drawer>

      <Box component="main" sx={{ flex: 1, p: 3 }}>
        <Toolbar />
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
          <Typography variant="h6">
            {selectedFolder ? selectedFolder.name : 'All Files'}
          </Typography>
          <UploadButton folderId={selectedFolder?.id} />
        </Box>
        <FileList folderId={selectedFolder?.id} />
      </Box>
    </Box>
  );
}
