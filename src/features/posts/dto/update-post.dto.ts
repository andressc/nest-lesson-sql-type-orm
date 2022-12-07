import { IsMongoId, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ValidateblogIdDecorator } from '../../../common/decorators/Validation';
import { Transform } from 'class-transformer';
import { trim } from '../../../common/helpers';

export class UpdatePostDto {
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

	@IsMongoId()
	@IsString()
	@ValidateblogIdDecorator()
	blogId: string;
}
