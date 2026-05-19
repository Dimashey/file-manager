export class FileNotFoundError extends Error {
  constructor() {
    super('File Not Found');
    this.name = 'FileNotFoundError';
  }
}
