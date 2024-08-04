import { HttpStatus } from '@nestjs/common';
import { DefaultError } from './default.error';

export class UnauthorizedError extends DefaultError {
  constructor(message?: string, error = new Error()) {
    super(error, message, 'UNAUTHORIZED_ERROR', HttpStatus.UNAUTHORIZED);
  }
}
