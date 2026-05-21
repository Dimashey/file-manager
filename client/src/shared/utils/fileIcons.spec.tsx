import { describe, it, expect } from 'vitest';
import { getFileIcon } from './fileIcons';
import ImageIcon from '@mui/icons-material/Image';
import VideoFileIcon from '@mui/icons-material/VideoFile';
import AudioFileIcon from '@mui/icons-material/AudioFile';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableChartIcon from '@mui/icons-material/TableChart';
import ArticleIcon from '@mui/icons-material/Article';
import FolderZipIcon from '@mui/icons-material/FolderZip';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';

describe('getFileIcon', () => {
  it('should return ImageIcon for image mime types', () => {
    const icon = getFileIcon('image/png');
    expect(icon.type).toBe(ImageIcon);
  });

  it('should return VideoFileIcon for video mime types', () => {
    const icon = getFileIcon('video/mp4');
    expect(icon.type).toBe(VideoFileIcon);
  });

  it('should return AudioFileIcon for audio mime types', () => {
    const icon = getFileIcon('audio/mpeg');
    expect(icon.type).toBe(AudioFileIcon);
  });

  it('should return PictureAsPdfIcon for application/pdf', () => {
    const icon = getFileIcon('application/pdf');
    expect(icon.type).toBe(PictureAsPdfIcon);
  });

  it('should return TableChartIcon for spreadsheets and excel files', () => {
    expect(getFileIcon('application/vnd.ms-excel').type).toBe(TableChartIcon);
    expect(getFileIcon('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet').type).toBe(TableChartIcon);
  });

  it('should return ArticleIcon for word and other document files', () => {
    expect(getFileIcon('application/msword').type).toBe(ArticleIcon);
    expect(getFileIcon('application/vnd.openxmlformats-officedocument.wordprocessingml.document').type).toBe(ArticleIcon);
  });

  it('should return FolderZipIcon for zip and compressed files', () => {
    expect(getFileIcon('application/zip').type).toBe(FolderZipIcon);
    expect(getFileIcon('application/x-tar').type).toBe(InsertDriveFileIcon); // doesn't include 'compressed' or 'zip'
    expect(getFileIcon('application/x-gtar').type).toBe(InsertDriveFileIcon);
    expect(getFileIcon('application/x-zip-compressed').type).toBe(FolderZipIcon);
  });

  it('should return InsertDriveFileIcon for unknown/default mime types', () => {
    const icon = getFileIcon('text/plain');
    expect(icon.type).toBe(InsertDriveFileIcon);
  });
});
