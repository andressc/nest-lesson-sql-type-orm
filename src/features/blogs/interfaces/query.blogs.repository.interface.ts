import { PaginationDto } from '../../../common/dto';
import { QueryBanDto } from '../dto/query-ban.dto';
import { ResponseBannedBlogOfUserDto } from '../dto/response-banned-blog-of-user.dto';
import { QueryBlogDto, ResponseBlogDto } from '../dto';
import { ResponseBlogAdminDto } from '../dto/response-blog-admin.dto';

/* eslint-disable */
export interface QueryBlogsRepositoryInterface {
	findAllBannedBlogOfUser(
		blogId: string,
		query: QueryBanDto,
		currentUserId: string,
	): Promise<PaginationDto<ResponseBannedBlogOfUserDto[]>>
	findAllBlogs(
		query: QueryBlogDto,
		currentUserId?: string,
	): Promise<PaginationDto<ResponseBlogDto[]>>
	findAllBlogsByAdmin(query: QueryBlogDto): Promise<PaginationDto<ResponseBlogAdminDto[]>>
	findBlogById(id: string): Promise<ResponseBlogDto>
}
