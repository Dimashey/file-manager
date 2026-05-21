export class SharedFolderNotFoundError extends Error {
  constructor() {
    super('Shared folder not found or is not marked as public');
    this.name = 'SharedFolderNotFoundError';
  }
}
