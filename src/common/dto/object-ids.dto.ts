import { IsString } from 'class-validator';

export class ObjectIdsDto {
	@IsString()
	blogId: string;

	@IsString()
	postId: string;
}
