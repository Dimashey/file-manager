export class InvalidParentFolderError extends Error {
  constructor() {
    super('Invalid Parent Folder');
    this.name = 'InvalidParentFolderError';
  }
}
