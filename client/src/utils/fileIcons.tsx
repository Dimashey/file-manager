import type { ReactElement } from 'react';
import ImageIcon from '@mui/icons-material/Image';
import VideoFileIcon from '@mui/icons-material/VideoFile';
import AudioFileIcon from '@mui/icons-material/AudioFile';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableChartIcon from '@mui/icons-material/TableChart';
import ArticleIcon from '@mui/icons-material/Article';
import FolderZipIcon from '@mui/icons-material/FolderZip';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';

export function getFileIcon(mimeType: string): ReactElement {
  if (mimeType.startsWith('image/')) return <ImageIcon />;
  if (mimeType.startsWith('video/')) return <VideoFileIcon />;
  if (mimeType.startsWith('audio/')) return <AudioFileIcon />;
  if (mimeType === 'application/pdf') return <PictureAsPdfIcon />;
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return <TableChartIcon />;
  if (mimeType.includes('word') || mimeType.includes('document')) return <ArticleIcon />;
  if (mimeType.includes('zip') || mimeType.includes('compressed')) return <FolderZipIcon />;
  return <InsertDriveFileIcon />;
}
