import { IsString } from 'class-validator';

export class ObjectIdUserDto {
	@IsString()
	blogId: string;

	@IsString()
	userId: string;
}
