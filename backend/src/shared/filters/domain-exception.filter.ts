import { ExceptionFilter, Catch, ArgumentsHost, Logger, HttpException } from '@nestjs/common';

import { Response } from 'express';
import { EmailAlreadyExistsError } from '../../modules/auth/domain/errors/email-already-exists.error';
import { InvalidCredentialsError } from '../../modules/auth/domain/errors/invalid-credentials.error';
import { FileNotFoundError } from '../../modules/file/domain/errors/file-not-found.error';
import { SharedFileNotFoundError } from '../../modules/file/domain/errors/shared-file-not-found.error';
import { CanNotMoveFileToFolderError } from '../../modules/file/domain/errors/can-not-move-file.error';
import { SharedFolderNotFoundError } from '../../modules/folder/domain/errors/shared-folder-not-found.error';
import { FolderCannotBeParentOfItselfError } from '../../modules/folder/domain/errors/folder-cannot-be-parent-of-itself.error';
import { FolderNameCannotBeEmptyError } from '../../modules/folder/domain/errors/folder-name-cannot-be-empty.error';
import { FolderNotFoundError } from '../../modules/folder/domain/errors/folder-not-found.error';
import { InvalidParentFolderError } from '../../modules/folder/domain/errors/invalid-parent-folder.error';

@Catch(Error)
export class DomainExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(DomainExceptionFilter.name);

  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      return res.status(status).json(typeof body === 'string' ? { message: body } : body);
    }

    /**
     * Auth
     * */
    if (exception instanceof InvalidCredentialsError) {
      return res.status(401).json({ message: exception.message });
    }

    if (exception instanceof EmailAlreadyExistsError) {
      return res.status(409).json({ message: exception.message });
    }

    /**
     * File
     * */
    if (exception instanceof FileNotFoundError) {
      return res.status(404).json({ message: exception.message });
    }

    if (exception instanceof SharedFileNotFoundError) {
      return res.status(404).json({ message: exception.message });
    }

    if (exception instanceof CanNotMoveFileToFolderError) {
      return res.status(400).json({ message: exception.message });
    }

    if (exception instanceof SharedFolderNotFoundError) {
      return res.status(404).json({ message: exception.message });
    }

    /**
     * Folder
     * */
    if (exception instanceof FolderNotFoundError) {
      return res.status(404).json({ message: exception.message });
    }

    if (exception instanceof FolderNameCannotBeEmptyError) {
      return res.status(400).json({ message: exception.message });
    }

    if (exception instanceof FolderCannotBeParentOfItselfError) {
      return res.status(400).json({ message: exception.message });
    }

    if (exception instanceof InvalidParentFolderError) {
      return res.status(400).json({ message: exception.message });
    }

    this.logger.error(exception.message, exception.stack);

    return res.status(500).json({ message: 'Internal server error' });
  }
}
