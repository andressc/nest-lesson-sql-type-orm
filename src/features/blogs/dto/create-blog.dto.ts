import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { trim } from '../../../common/helpers';

export class CreateBlogDto {
	@IsNotEmpty()
	@IsString()
	@Transform(({ value }) => trim(value.toString()))
	@MaxLength(15)
	name: string;

	@IsNotEmpty()
	@IsString()
	@Matches(/^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/)
	@MaxLength(100)
	websiteUrl: string;

	@IsNotEmpty()
	@IsString()
	@Transform(({ value }) => trim(value.toString()))
	@MaxLength(500)
	description: string;
}
