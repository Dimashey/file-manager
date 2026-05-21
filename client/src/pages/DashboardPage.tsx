import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { AppShell } from '../components/layout/AppShell';

export function DashboardPage() {
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);

  return (
    <AppShell selectedFolderId={currentFolderId} onFolderSelect={setCurrentFolderId}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" color="text.secondary">
          {currentFolderId ? `Folder: ${currentFolderId}` : 'My Drive'}
        </Typography>
        <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>
          File grid coming in Phase 3.
        </Typography>
      </Box>
    </AppShell>
  );
}
