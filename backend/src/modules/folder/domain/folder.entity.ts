import { FolderCannotBeParentOfItselfError } from './errors/folder-cannot-be-parent-of-itself.error';
import { FolderNameCannotBeEmptyError } from './errors/folder-name-cannot-be-empty.error';

export class Folder {
  constructor(
    /** Unique identifier for the folder */
    public readonly id: string,

    /** Display name of the folder */
    public name: string,

    /** Parent folder ID. Null means root-level folder. */
    public parentId: string | null,

    /** ID of the user who owns this folder */
    public readonly ownerId: string,

    /** Whether this folder is publicly accessible without authentication */
    public isPublic: boolean,

    /** Sort position within the parent folder. Lower values appear first. */
    public position: number,

    /** Timestamp when the folder was created */
    public readonly createdAt: Date,

    /** Timestamp of the most recent update to this folder */
    public updatedAt: Date,
  ) {}

  rename(name: string) {
    if (!name.trim()) {
      throw new FolderNameCannotBeEmptyError();
    }

    this.name = name;
    this.touch();
  }

  moveToParent(parentId: string | null) {
    if (parentId === this.id) {
      throw new FolderCannotBeParentOfItselfError();
    }

    this.parentId = parentId;
    this.touch();
  }

  private touch() {
    this.updatedAt = new Date();
  }
}
