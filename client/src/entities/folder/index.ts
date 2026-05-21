export type Folder = {
  /** Unique folder identifier (UUID). */
  id: string;
  /** Display name of the folder. */
  name: string;
  /** Parent folder ID, or null if the folder is at the root. */
  parentId: string | null;
  /** ID of the user who owns this folder. */
  ownerId: string;
  /** Whether the folder is accessible via a public share link. */
  isPublic: boolean;
  /** Zero-based sort position within the parent folder. */
  position: number;
  /** ISO 8601 creation timestamp. */
  createdAt: string;
  /** ISO 8601 last-modified timestamp. */
  updatedAt: string;
};

export type FolderReorderItem = {
  /** ID of the folder to reorder. */
  id: string;
  /** New zero-based position index. */
  position: number;
};
