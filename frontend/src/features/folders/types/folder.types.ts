export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  ownerId: string;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFolderPayload {
  name: string;
  parentId?: string;
}

export interface UpdateFolderPayload {
  name?: string;
  parentId?: string | null;
}

export interface ReorderFolderItem {
  id: string;
  position: number;
}
