export class File {
  constructor(
    /** Unique identifier for the file */
    public readonly id: string,

    /** Display name shown to the user (can be renamed) */
    public name: string,

    /** Original filename from the upload */
    public readonly originalName: string,

    /** MIME type detected at upload time */
    public readonly mimeType: string,

    /** File extension including dot, e.g. ".pdf", ".jpg" */
    public readonly extension: string,

    /** File size in bytes */
    public readonly size: number,

    /** Object key in MinIO storage bucket */
    public readonly storagePath: string,

    /** Compressed thumbnail path in MinIO. Only populated for image files after background job completes. */
    public thumbnailPath: string | null,

    /** Parent folder ID. Null means the file is at root level. */
    public folderId: string | null,

    /** ID of the user who owns this file */
    public readonly ownerId: string,

    /** Whether this file is publicly accessible without authentication */
    public isPublic: boolean,

    /** Sort position within the parent folder */
    public position: number,

    /** Timestamp when the file was uploaded */
    public readonly createdAt: Date,

    /** Timestamp of the most recent update to this file record */
    public updatedAt: Date,
  ) {}

  setThumbnail(path: string | null) {
    this.thumbnailPath = path;

    this.touch();
  }

  private touch() {
    this.updatedAt = new Date();
  }
}
