import { Injectable } from '@nestjs/common';
import sharp from 'sharp';
import { Readable } from 'stream';

@Injectable()
export class SharpImageService {
  async createThumbnail(stream: Readable): Promise<Buffer> {
    const pipeline = sharp().resize(300).jpeg();
    return stream.pipe(pipeline).toBuffer();
  }
}
