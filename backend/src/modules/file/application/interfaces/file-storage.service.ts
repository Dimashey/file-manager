import { Readable } from 'stream';

export abstract class FileStorageService {
  abstract upload(key: string, body: Buffer, contentType: string): Promise<string>;

  abstract download(key: string): Promise<Readable>;

  abstract delete(key: string): Promise<void>;

  abstract copy(sourceKey: string, destKey: string): Promise<string>;
}
