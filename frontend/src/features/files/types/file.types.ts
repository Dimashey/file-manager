export interface FileRecord {
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

export interface UpdateFilePayload {
  name?: string;
  folderId?: string | null;
  isPublic?: boolean;
}

export interface ReorderFileItem {
  id: string;
  position: number;
}
