import { IsBoolean, IsString, MinLength } from 'class-validator';

export class BanUnbanBlogOfUserDto {
	@IsBoolean()
	isBanned: boolean;

	@MinLength(20)
	banReason: string;

	@IsString()
	blogId: string;
}
