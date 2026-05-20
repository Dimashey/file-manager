import { Box, CircularProgress, Typography } from '@mui/material';
import {
  DndContext, KeyboardSensor, PointerSensor,
  closestCenter, useSensor, useSensors, type DragEndEvent,
} from '@dnd-kit/core';
import {
  CSS, arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable';
import { useFiles } from '../hooks/useFiles';
import { useReorderFiles } from '../hooks/useFileActions';
import type { FileRecord } from '../types/file.types';
import { FileCard } from './FileCard';

function SortableFileCard({ file, folderId }: { file: FileRecord; folderId?: string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: file.id });

  return (
    <Box
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
      {...attributes}
      {...listeners}
    >
      <FileCard file={file} folderId={folderId} />
    </Box>
  );
}

interface Props {
  folderId?: string;
}

export function FileList({ folderId }: Props) {
  const { data: files = [], isLoading } = useFiles(folderId);
  const reorder = useReorderFiles(folderId);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const oldIndex = files.findIndex((f) => f.id === active.id);
    const newIndex = files.findIndex((f) => f.id === over.id);
    const reordered = arrayMove(files, oldIndex, newIndex);
    reorder.mutate(reordered.map((f, position) => ({ id: f.id, position })));
  };

  if (isLoading) return <CircularProgress />;

  if (!files.length) {
    return (
      <Typography color="text.secondary" sx={{ mt: 6, textAlign: 'center' }}>
        No files here. Upload one to get started.
      </Typography>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={files.map((f) => f.id)} strategy={rectSortingStrategy}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {files.map((file) => (
            <SortableFileCard key={file.id} file={file} folderId={folderId} />
          ))}
        </Box>
      </SortableContext>
    </DndContext>
  );
}
