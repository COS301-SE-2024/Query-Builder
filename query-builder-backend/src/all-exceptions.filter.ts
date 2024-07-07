import {
  Catch,
  ArgumentsHost,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { isAuthApiError } from '@supabase/supabase-js';
import { Request, Response } from 'express';

type MyErrorObject = {
  response: string | object;
  statusCode: number;
  path: string;
  timestamp: string;
};

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const myResponse: MyErrorObject = {
      response: '',
      statusCode: 200,
      path: request.url,
      timestamp: new Date().toISOString(),
    };

    if (exception instanceof HttpException) {
      myResponse.response = exception.getResponse();
      myResponse.statusCode = exception.getStatus();
    } else if (isAuthApiError(exception)) {
      myResponse.response = {
        message: exception.message,
        code: exception.code,
      };
      myResponse.statusCode = exception.status;
    } else {
      myResponse.response = 'Internal server error';
      if (exception instanceof Object) {
        myResponse.response = exception;
      }
      myResponse.statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    }

    response.status(myResponse.statusCode).json(myResponse);

    super.catch(exception, host);
  }
}
