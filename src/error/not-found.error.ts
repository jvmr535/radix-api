import { HttpStatus } from '@nestjs/common';
import { DefaultError } from './default.error';

export class NotFoundError extends DefaultError {
  constructor(message?: string, error = new Error()) {
    super(error, message, 'NOT_FOUND_ERROR', HttpStatus.NOT_FOUND);
  }
}
