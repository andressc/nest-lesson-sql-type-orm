import { PaginationDto, QueryDto } from '../../../common/dto';
import { ResponsePostDto } from '../dto';

/* eslint-disable */
export interface QueryPostsRepositoryInterface {
	findAllPosts(
		query: QueryDto,
		currentUserId: string | null,
		blogId?: string,
	): Promise<PaginationDto<ResponsePostDto[]>>
	findPostById(id: string, currentUserId: string | null): Promise<ResponsePostDto | null>
}
