import { HttpStatus } from '@nestjs/common';
import { DefaultError } from './default.error';

export class PayloadTooLargeError extends DefaultError {
  constructor(message?: string, error = new Error()) {
    super(
      error,
      message,
      'PAYLOAD_TOO_LARGE_ERROR',
      HttpStatus.PAYLOAD_TOO_LARGE,
    );
  }
}
