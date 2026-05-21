export type FileItem = {
  /** Unique file identifier (UUID). */
  id: string;
  /** Display name; may differ from originalName if the file was renamed. */
  name: string;
  /** Filename as originally uploaded. */
  originalName: string;
  /** MIME type of the file content (e.g. "image/png"). */
  mimeType: string;
  /** File extension without the leading dot (e.g. "png"). */
  extension: string;
  /** File size in bytes. */
  size: number;
  /** Server-side storage path relative to the upload root. */
  storagePath: string;
  /** Path to the generated thumbnail, or null if none. */
  thumbnailPath: string | null;
  /** Parent folder ID, or null if the file is at the root. */
  folderId: string | null;
  /** ID of the user who owns this file. */
  ownerId: string;
  /** Whether the file is accessible via a public share link. */
  isPublic: boolean;
  /** Zero-based sort position within the parent folder. */
  position: number;
  /** ISO 8601 creation timestamp. */
  createdAt: string;
  /** ISO 8601 last-modified timestamp. */
  updatedAt: string;
};

export type FileReorderItem = {
  /** ID of the file to reorder. */
  id: string;
  /** New zero-based position index. */
  position: number;
};
