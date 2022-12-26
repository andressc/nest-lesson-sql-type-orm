import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { LikeStatusEnum } from '../../../common/dto';

export class CreateLikeDto {
	@IsString()
	itemId: string;

	@IsString()
	userId: string;

	@IsNotEmpty()
	@IsString()
	login: string;

	@IsEnum(LikeStatusEnum)
	likeStatus: LikeStatusEnum;
}
