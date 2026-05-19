import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import type { Queue } from 'bull';
import { ImageProcessingQueueService } from 'src/modules/file/application/interfaces/image-processing-queue.service';

@Injectable()
export class BullImageProcessingQueueService implements ImageProcessingQueueService {
  constructor(
    @InjectQueue('image-compression')
    private readonly queue: Queue,
  ) {}

  async enqueueCompression(input: { fileId: string; storageKey: string; mimeType: string }) {
    await this.queue.add('compress', input);
  }
}
