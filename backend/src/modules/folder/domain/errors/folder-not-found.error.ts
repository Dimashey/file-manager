export class FolderNotFoundError extends Error {
  constructor() {
    super('Folder Not Found');
    this.name = 'FolderNotFoundError';
  }
}
