import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const isHttp = exception instanceof HttpException;
    const status = isHttp
      ? (exception as HttpException).getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = isHttp
      ? (exception as HttpException).message
      : 'Internal server error';

    const errorBody = isHttp
      ? (exception as HttpException).getResponse()
      : undefined;

    const error = typeof errorBody === 'object' && errorBody && 'error' in errorBody
      ? (errorBody as any).error
      : HttpStatus[status] || 'Error';

    const messages = typeof errorBody === 'object' && errorBody && 'message' in errorBody
      ? (errorBody as any).message
      : message;

    response.status(status).json({
      statusCode: status,
      error,
      message: messages,
      path: request.originalUrl,
      timestamp: new Date().toISOString(),
    });
  }
}
