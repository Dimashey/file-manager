export class FolderCannotBeParentOfItselfError extends Error {
  constructor() {
    super('Folder cannot be parent of itself');
    this.name = 'FolderCannotBeParentOfItselfError';
  }
}
