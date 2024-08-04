import { HttpStatus } from '@nestjs/common';
import { DefaultError } from './default.error';

export class BadRequestError extends DefaultError {
  constructor(message?: string, error?: Error) {
    super(error, message, 'BAD_REQUEST_ERROR', HttpStatus.BAD_REQUEST);
  }
}
