export class CanNotMoveFileToFolderError extends Error {
  constructor() {
    super('Can not move file to folder');
    this.name = 'CanNotMoveFileToFolderError';
  }
}
