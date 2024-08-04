import { HttpException, HttpStatus } from '@nestjs/common';

export class DefaultError extends HttpException {
  constructor(
    error: any,
    message?: string,
    code?: string,
    statusCode?: number,
  ) {
    const DEFAULT_MESSAGE =
      'Ocorreu um erro, tente novamente ou entre em contato com o administrador do sistema!';
    super(
      {
        message: message || DEFAULT_MESSAGE,
        code: code || 'DEFAULT_CODE_ERROR ',
      },
      statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
