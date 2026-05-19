import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';

import { Response } from 'express';
import { FolderNotFoundError } from '../../domain/errors/folder-not-found.error';
import { FolderNameCannotBeEmptyError } from '../../domain/errors/folder-name-cannot-be-empty.error';
import { FolderCannotBeParentOfItselfError } from '../../domain/errors/folder-cannot-be-parent-of-itself.error';
import { InvalidParentFolderError } from '../../domain/errors/invalid-parent-folder.error';

@Catch(Error)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    // map domain → HTTP
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

    return res.status(500).json({ message: 'Internal server error' });
  }
}
