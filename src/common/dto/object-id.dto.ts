import { IsString } from 'class-validator';

export class ObjectIdDto {
	@IsString()
	id: string;
}
