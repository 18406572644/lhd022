import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { QueryFailedError } from 'typeorm';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal Server Error';

    console.error('Exception caught:', exception);

    if (exception instanceof HttpException) {
      status = exception.getStatus() || HttpStatus.INTERNAL_SERVER_ERROR;
      const exceptionResponse = exception.getResponse();
      message = typeof exceptionResponse === 'string'
        ? exceptionResponse
        : (exceptionResponse as any).message || 'Internal Server Error';
    } else if (exception instanceof QueryFailedError) {
      message = 'Database query failed';
      console.error('Query failed:', exception.message);
    } else if (exception instanceof Error) {
      message = exception.message || 'Internal Server Error';
    }

    response.status(status).json({
      code: status,
      message: message,
      data: null,
      timestamp: new Date().toISOString(),
    });
  }
}
