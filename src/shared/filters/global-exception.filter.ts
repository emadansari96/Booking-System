import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'INTERNAL_SERVER_ERROR';
    let details: any = {};

    // Handle HTTP exceptions
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseObj = exceptionResponse as any;
        message = responseObj.message || exception.message;
        error = responseObj.error || 'HTTP_EXCEPTION';
        details = responseObj.details || {};
      } else {
        message = exception.message;
        error = 'HTTP_EXCEPTION';
      }
    }
    // Handle Prisma errors
    else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      status = HttpStatus.BAD_REQUEST;
      error = 'DATABASE_ERROR';
      
      switch (exception.code) {
        case 'P2002':
          message = 'Unique constraint violation';
          details = { constraint: exception.meta?.target };
          break;
        case 'P2025':
          message = 'Record not found';
          error = 'RECORD_NOT_FOUND';
          break;
        case 'P2003':
          message = 'Foreign key constraint violation';
          details = { field: exception.meta?.field_name };
          break;
        case 'P2014':
          message = 'Invalid ID provided';
          break;
        default:
          message = 'Database operation failed';
          details = { code: exception.code };
      }
    }
    // Handle Prisma validation errors
    else if (exception instanceof Prisma.PrismaClientValidationError) {
      status = HttpStatus.BAD_REQUEST;
      message = 'Invalid data provided';
      error = 'VALIDATION_ERROR';
      details = { reason: 'Data validation failed' };
    }
    // Handle Prisma connection errors
    else if (exception instanceof Prisma.PrismaClientInitializationError) {
      status = HttpStatus.SERVICE_UNAVAILABLE;
      message = 'Database connection failed';
      error = 'DATABASE_CONNECTION_ERROR';
    }
    // Handle Prisma timeout errors
    else if (exception instanceof Prisma.PrismaClientRustPanicError) {
      status = HttpStatus.SERVICE_UNAVAILABLE;
      message = 'Database service unavailable';
      error = 'DATABASE_SERVICE_UNAVAILABLE';
    }
    // Handle generic errors
    else if (exception instanceof Error) {
      message = exception.message;
      error = 'APPLICATION_ERROR';
      
      // Check for specific error patterns
      if (exception.message.includes('overlap') || exception.message.includes('exclusion')) {
        status = HttpStatus.CONFLICT;
        error = 'PERIOD_OVERLAP';
        message = 'Booking period overlaps with existing reservation';
      } else if (exception.message.includes('not found')) {
        status = HttpStatus.NOT_FOUND;
        error = 'NOT_FOUND';
      } else if (exception.message.includes('unauthorized') || exception.message.includes('forbidden')) {
        status = HttpStatus.FORBIDDEN;
        error = 'FORBIDDEN';
      } else if (exception.message.includes('validation') || exception.message.includes('invalid')) {
        status = HttpStatus.BAD_REQUEST;
        error = 'VALIDATION_ERROR';
      }
    }

    // Log the error
    this.logger.error(
      `Exception caught: ${message}`,
      {
        error: error,
        status: status,
        path: request.url,
        method: request.method,
        userAgent: request.headers['user-agent'],
        ip: (request as any).ip || (request as any).connection?.remoteAddress,
        details: details,
        stack: exception instanceof Error ? exception.stack : undefined,
      }
    );

    // Send response
    (response as any).status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: message,
      error: error,
      details: details,
    });
  }
}
