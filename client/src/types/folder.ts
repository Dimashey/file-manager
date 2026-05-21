export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  ownerId: string;
  isPublic: boolean;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface FolderReorderItem {
  id: string;
  position: number;
}
