import { BanUnbanBlogOfUserDto } from './ban-unban-blog-of-user.dto';

export class BanUnbanBlogOfUserExtendsDto extends BanUnbanBlogOfUserDto {
	userId: string;
	banDate: string;
	createdAt: string;
}
