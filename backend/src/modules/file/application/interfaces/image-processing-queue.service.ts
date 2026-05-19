export abstract class ImageProcessingQueueService {
  abstract enqueueCompression(input: {
    fileId: string;
    storageKey: string;
    mimeType: string;
  }): Promise<void>;
}
