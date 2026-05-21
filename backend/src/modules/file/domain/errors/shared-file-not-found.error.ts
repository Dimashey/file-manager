export class SharedFileNotFoundError extends Error {
  constructor() {
    super('Shared file not found or is not marked as public');
    this.name = 'SharedFileNotFoundError';
  }
}
