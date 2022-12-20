import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
	catch(exception: HttpException, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const request = ctx.getRequest<Request>();
		const status = exception.getStatus();

		if (status === 400) {
			const errorsResponse = {
				errorsMessages: [],
			};

			const responseBody: any = exception.getResponse();

			console.log(responseBody);

			if (Array.isArray(responseBody.message)) {
				responseBody.message.forEach((m) =>
					errorsResponse.errorsMessages.push({
						message: m.message,
						field: m.field,
					}),
				);
				return response.status(status).json(errorsResponse);
			}

			return response.status(status).json(responseBody);
		}

		if (status === 404 || status === 403) {
			const errorsResponse = {
				errorsMessages: [],
			};

			const responseBody: any = exception.getResponse();

			errorsResponse.errorsMessages.push({
				message: responseBody.message,
				field: responseBody.field,
			});

			return response.status(status).json(errorsResponse);
		}

		return response.status(status).json({
			statusCode: status,
			timestamp: new Date().toISOString(),
			path: request.url,
		});
	}
}
