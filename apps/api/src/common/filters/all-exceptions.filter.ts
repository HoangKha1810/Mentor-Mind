import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ZodError } from 'zod';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status =
      exception instanceof ZodError
        ? HttpStatus.BAD_REQUEST
        : exception instanceof HttpException
          ? exception.getStatus()
          : HttpStatus.INTERNAL_SERVER_ERROR;
    const raw = exception instanceof HttpException ? exception.getResponse() : undefined;
    const message =
      typeof raw === 'object' && raw !== null && 'message' in raw
        ? raw.message
        : exception instanceof Error
          ? exception.message
          : 'Unexpected error';

    response.status(status).json({
      success: false,
      error: {
        code:
          exception instanceof ZodError
            ? 'VALIDATION_ERROR'
            : exception instanceof HttpException
              ? exception.name
              : 'INTERNAL_SERVER_ERROR',
        message: Array.isArray(message) ? message.join(', ') : String(message),
        details: typeof raw === 'object' ? raw : {},
      },
    });
  }
}
