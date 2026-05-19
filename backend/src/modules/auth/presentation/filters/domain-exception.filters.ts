import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';

import { Response } from 'express';
import { EmailAlreadyExistsError } from '../../domain/errors/email-already-exists.error';
import { InvalidCredentialsError } from '../../domain/errors/invalid-credentials.error';

@Catch(Error)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    // map domain → HTTP
    if (exception instanceof InvalidCredentialsError) {
      return res.status(401).json({ message: exception.message });
    }

    if (exception instanceof EmailAlreadyExistsError) {
      return res.status(409).json({ message: exception.message });
    }

    return res.status(500).json({ message: 'Internal server error' });
  }
}
