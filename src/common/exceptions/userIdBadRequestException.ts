import { BadRequestException } from '@nestjs/common';

export class userIdBadRequestException extends BadRequestException {
	constructor() {
		super([{ message: 'error it is impossible to ban yourself', field: 'userId' }]);
	}
}
