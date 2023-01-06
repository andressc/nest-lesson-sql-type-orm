import { QueryCommentDto, ResponseCommentDto } from '../dto';
import { PaginationDto } from '../../../common/dto';
import { ResponseCommentOfPostsDto } from '../dto/response-comment-of-posts.dto';

/* eslint-disable */
export interface QueryCommentsRepositoryInterface {
	findAllCommentsOfBlogs(
		query: QueryCommentDto,
		currentUserId: string | null,
	): Promise<PaginationDto<ResponseCommentOfPostsDto[]>>
	findAllCommentsOfPost(
		query: QueryCommentDto,
		postId: string,
		currentUserId: string | null,
	): Promise<PaginationDto<ResponseCommentDto[]>>
	findCommentById(id: string, currentUserId: string | null): Promise<ResponseCommentDto>
}
