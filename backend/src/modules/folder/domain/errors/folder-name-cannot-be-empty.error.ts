export class FolderNameCannotBeEmptyError extends Error {
  constructor() {
    super('Folder name cannot be empty');
    this.name = 'FolderNameCannotBeEmptyError';
  }
}
