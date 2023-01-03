import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ValidateblogIdDecorator } from '../../../common/decorators/Validation';
import { trim } from '../../../common/helpers';
import { Transform } from 'class-transformer';

export class CreatePostDto {
	@IsNotEmpty()
	@IsString()
	@Transform(({ value }) => trim(value.toString()))
	@MaxLength(30)
	title: string;

	@IsNotEmpty()
	@IsString()
	@Transform(({ value }) => trim(value.toString()))
	@MaxLength(100)
	shortDescription: string;

	@IsNotEmpty()
	@IsString()
	@Transform(({ value }) => trim(value.toString()))
	@MaxLength(1000)
	content: string;

	@ValidateblogIdDecorator()
	@IsString()
	blogId: string;
}
