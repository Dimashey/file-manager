import { Processor, Process } from '@nestjs/bull';
import type { Job } from 'bull';
import { FileStorageService } from 'src/modules/file/application/interfaces/file-storage.service';
import { FileRepository } from 'src/modules/file/domain/repositories/file.repository';
import { SharpImageService } from '../../image/share-image.service';

@Processor('image-compression')
export class ImageCompressionProcessor {
  constructor(
    private readonly storage: FileStorageService,
    private readonly fileRepo: FileRepository,
    private readonly imageService: SharpImageService,
  ) {}

  @Process('compress')
  async handle(
    job: Job<{
      fileId: string;
      storageKey: string;
    }>,
  ) {
    const file = await this.fileRepo.findById(job.data.fileId);

    if (!file) return;

    const stream = await this.storage.download(file.storagePath);

    const thumbnail = await this.imageService.createThumbnail(stream);

    const thumbnailKey = `${file.ownerId}/thumb-${file.id}.jpg`;

    await this.storage.upload(thumbnailKey, thumbnail, 'image/jpeg');

    file.setThumbnail(thumbnailKey);

    await this.fileRepo.save(file);
  }
}
