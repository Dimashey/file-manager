export interface FileItem {
  id: string;
  name: string;
  originalName: string;
  mimeType: string;
  extension: string;
  size: number;
  storagePath: string;
  thumbnailPath: string | null;
  folderId: string | null;
  ownerId: string;
  isPublic: boolean;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface FileReorderItem {
  id: string;
  position: number;
}
