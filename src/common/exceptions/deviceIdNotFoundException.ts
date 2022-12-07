import { NotFoundException } from '@nestjs/common';

export class deviceIdNotFoundException extends NotFoundException {
	constructor(deviceId: string) {
		super({
			message: `session id = ${deviceId} not found`,
			field: 'deviceId',
		});
	}
}
