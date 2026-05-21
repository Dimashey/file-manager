import { useState } from 'react';
import { Box, Breadcrumbs, Link, Typography } from '@mui/material';
import { AppShell } from '../components/layout/AppShell';
import { FileGrid } from '../components/files/FileGrid';
import { UploadButton } from '../components/files/UploadButton';

interface BreadcrumbEntry {
  id: string;
  name: string;
}

export function DashboardPage() {
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [breadcrumb, setBreadcrumb] = useState<BreadcrumbEntry[]>([]);

  const handleSidebarSelect = (id: string | null) => {
    setCurrentFolderId(id);
    setBreadcrumb([]);
  };

  const handleFolderNavigate = (folder: BreadcrumbEntry) => {
    setCurrentFolderId(folder.id);
    setBreadcrumb((prev) => [...prev, folder]);
  };

  const handleBreadcrumbClick = (index: number) => {
    if (index === -1) {
      setCurrentFolderId(null);
      setBreadcrumb([]);
    } else {
      const entry = breadcrumb[index];
      setCurrentFolderId(entry.id);
      setBreadcrumb((prev) => prev.slice(0, index + 1));
    }
  };

  const currentName = breadcrumb.length > 0 ? breadcrumb[breadcrumb.length - 1].name : 'My Drive';

  return (
    <AppShell selectedFolderId={currentFolderId} onFolderSelect={handleSidebarSelect}>
      <Box sx={{ p: 3, pb: 12 }}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link
            underline="hover"
            color={breadcrumb.length === 0 ? 'text.primary' : 'inherit'}
            sx={{ cursor: 'pointer', fontWeight: breadcrumb.length === 0 ? 700 : 400 }}
            onClick={() => handleBreadcrumbClick(-1)}
          >
            My Drive
          </Link>
          {breadcrumb.map((entry, i) => {
            const isLast = i === breadcrumb.length - 1;
            return isLast ? (
              <Typography key={entry.id} color="text.primary" sx={{ fontWeight: 700 }}>
                {entry.name}
              </Typography>
            ) : (
              <Link
                key={entry.id}
                underline="hover"
                color="inherit"
                sx={{ cursor: 'pointer' }}
                onClick={() => handleBreadcrumbClick(i)}
              >
                {entry.name}
              </Link>
            );
          })}
        </Breadcrumbs>

        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          {currentName}
        </Typography>

        <FileGrid folderId={currentFolderId} onFolderNavigate={handleFolderNavigate} />
      </Box>

      <UploadButton folderId={currentFolderId} />
    </AppShell>
  );
}
