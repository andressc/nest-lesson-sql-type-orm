import { IsMongoId, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ValidateblogIdDecorator } from '../../../common/decorators/Validation';
import { trim } from '../../../common/helpers';
import { Transform } from 'class-transformer';

export class CreatePostDto {
	@IsNotEmpty()
	@Transform(({ value }) => trim(value))
	@MaxLength(30)
	title: string;

	@IsNotEmpty()
	@Transform(({ value }) => trim(value))
	@MaxLength(100)
	shortDescription: string;

	@IsNotEmpty()
	@Transform(({ value }) => trim(value))
	@MaxLength(1000)
	content: string;

	@ValidateblogIdDecorator()
	@IsMongoId()
	@IsString()
	blogId: string;
}
