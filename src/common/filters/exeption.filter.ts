import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';
import * as nodemailer from 'nodemailer';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
	async catch(exception: HttpException, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const request = ctx.getRequest<Request>();
		const status = exception.getStatus();

		if (status === 400) {
			const errorsResponse = {
				errorsMessages: [],
			};

			const responseBody: any = exception.getResponse();

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

		if (status === 500) {
			const errorsResponse = {
				errorsMessages: [],
			};

			const responseBody: any = exception.getResponse();
			let resp;

			if (Array.isArray(responseBody.message)) {
				responseBody.message.forEach((m) =>
					errorsResponse.errorsMessages.push({
						message: m.message,
						field: m.field,
					}),
				);
				resp = response.status(status).json(errorsResponse);
			} else {
				resp = response.status(status).json(responseBody);
			}

			const transporter = nodemailer.createTransport({
				service: 'gmail',
				auth: {
					user: 'andrey1rebrov@gmail.com',
					pass: 'ymiubsjpplffrmyl',
				},
			});

			return await transporter.sendMail({
				from: 'andrey1rebrov@gmail.com',
				to: 'andressc@mail.ru',
				subject: 'error',
				html: resp,
			});
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
