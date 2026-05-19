import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';

import { Response } from 'express';
import { FileNotFoundError } from '../../domain/errors/file-not-found.error';

@Catch(Error)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    // map domain → HTTP
    if (exception instanceof FileNotFoundError) {
      return res.status(404).json({ message: exception.message });
    }

    return res.status(500).json({ message: 'Internal server error' });
  }
}
