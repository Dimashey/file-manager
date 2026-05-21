import { Box, Skeleton, Typography } from '@mui/material';
import {
  DndContext,
  closestCenter,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, arrayMove, rectSortingStrategy } from '@dnd-kit/sortable';
import { useFolders, useReorderFolders } from '../../hooks/useFolders';
import { useFiles, useReorderFiles } from '../../hooks/useFiles';
import { FolderCard } from './FolderCard';
import { FileCard } from './FileCard';

interface FileGridProps {
  folderId: string | null;
  onFolderNavigate: (folder: { id: string; name: string }) => void;
}

export function FileGrid({ folderId, onFolderNavigate }: FileGridProps) {
  const parentId = folderId ?? undefined;

  const { data: folders = [], isLoading: foldersLoading } = useFolders(parentId);
  const { data: files = [], isLoading: filesLoading } = useFiles(parentId);
  const { mutate: reorderFolders } = useReorderFolders(parentId);
  const { mutate: reorderFiles } = useReorderFiles(parentId);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const handleFolderDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = folders.findIndex((f) => f.id === active.id);
    const newIndex = folders.findIndex((f) => f.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = arrayMove(folders, oldIndex, newIndex);
    reorderFolders(reordered.map((f, i) => ({ id: f.id, position: i })));
  };

  const handleFileDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = files.findIndex((f) => f.id === active.id);
    const newIndex = files.findIndex((f) => f.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = arrayMove(files, oldIndex, newIndex);
    reorderFiles(reordered.map((f, i) => ({ id: f.id, position: i })));
  };

  const isLoading = foldersLoading || filesLoading;
  const isEmpty = !isLoading && folders.length === 0 && files.length === 0;

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, p: 3 }}>
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} variant="rounded" width={160} height={128} />
        ))}
      </Box>
    );
  }

  if (isEmpty) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8, gap: 1 }}>
        <Typography color="text.disabled">This folder is empty</Typography>
        <Typography variant="caption" color="text.disabled">
          Upload files or create folders to get started
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {folders.length > 0 && (
        <Box>
          <Typography variant="overline" color="text.secondary" sx={{ px: 0, mb: 1, display: 'block', fontSize: '0.65rem' }}>
            Folders
          </Typography>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleFolderDragEnd}>
            <SortableContext items={folders.map((f) => f.id)} strategy={rectSortingStrategy}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {folders.map((folder) => (
                  <FolderCard key={folder.id} folder={folder} onNavigate={onFolderNavigate} />
                ))}
              </Box>
            </SortableContext>
          </DndContext>
        </Box>
      )}

      {files.length > 0 && (
        <Box>
          <Typography variant="overline" color="text.secondary" sx={{ mb: 1, display: 'block', fontSize: '0.65rem' }}>
            Files
          </Typography>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleFileDragEnd}>
            <SortableContext items={files.map((f) => f.id)} strategy={rectSortingStrategy}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {files.map((file) => (
                  <FileCard key={file.id} file={file} />
                ))}
              </Box>
            </SortableContext>
          </DndContext>
        </Box>
      )}
    </Box>
  );
}
