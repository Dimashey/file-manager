import { type ReactNode } from 'react';
import { Box, Drawer } from '@mui/material';
import { TopBar } from './TopBar';
import { FolderTree } from '../sidebar/FolderTree';

const DRAWER_WIDTH = 260;
const APPBAR_HEIGHT = 64;

interface AppShellProps {
  selectedFolderId: string | null;
  onFolderSelect: (id: string | null) => void;
  onFolderNavigate: (folder: { id: string; name: string }) => void;
  children: ReactNode;
}

export function AppShell({ selectedFolderId, onFolderSelect, onFolderNavigate, children }: AppShellProps) {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <TopBar onFolderNavigate={onFolderNavigate} />

      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            top: `${APPBAR_HEIGHT}px`,
            height: `calc(100% - ${APPBAR_HEIGHT}px)`,
            borderRight: '1px solid',
            borderColor: 'divider',
          },
        }}
      >
        <FolderTree selectedFolderId={selectedFolderId} onSelect={onFolderSelect} />
      </Drawer>

      <Box
        component="main"
        sx={{
          flex: 1,
          mt: `${APPBAR_HEIGHT}px`,
          ml: `${DRAWER_WIDTH}px`,
          minHeight: `calc(100vh - ${APPBAR_HEIGHT}px)`,
          bgcolor: 'background.default',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
