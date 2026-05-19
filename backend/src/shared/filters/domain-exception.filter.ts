import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';

import { Response } from 'express';
import { EmailAlreadyExistsError } from 'src/modules/auth/domain/errors/email-already-exists.error';
import { InvalidCredentialsError } from 'src/modules/auth/domain/errors/invalid-credentials.error';
import { FileNotFoundError } from 'src/modules/file/domain/errors/file-not-found.error';
import { FolderCannotBeParentOfItselfError } from 'src/modules/folder/domain/errors/folder-cannot-be-parent-of-itself.error';
import { FolderNameCannotBeEmptyError } from 'src/modules/folder/domain/errors/folder-name-cannot-be-empty.error';
import { FolderNotFoundError } from 'src/modules/folder/domain/errors/folder-not-found.error';
import { InvalidParentFolderError } from 'src/modules/folder/domain/errors/invalid-parent-folder.error';

@Catch(Error)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    // map domain → HTTP
    //

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

    return res.status(500).json({ message: 'Internal server error' });
  }
}
