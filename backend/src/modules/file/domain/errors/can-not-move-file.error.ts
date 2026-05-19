export class CanNotMoveFileToFilderError extends Error {
  constructor() {
    super('Can not move file to folder');
    this.name = 'CanNotMoveFileToFilderError';
  }
}
