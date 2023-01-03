import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { LikeStatusEnum, PaginationCalc, PaginationDto } from '../../../../common/dto';
import { QueryCommentDto } from '../../dto';
import { CommentModel } from '../../domain/comment.schema';
import { PaginationService } from '../../../../shared/pagination/application/pagination.service';
import { QueryCommentsRepositoryInterface } from '../../interfaces/query.comments.repository.interface';
import { QueryPostsRepositoryInterface } from '../../../posts/interfaces/query.posts.repository.interface';
import { Inject } from '@nestjs/common';
import { CommentInjectionToken } from '../../infrastructure/providers/comment.injection.token';
import { PostInjectionToken } from '../../../posts/infrastructure/providers/post.injection.token';
import { ResponseCommentOfPostsDto } from '../../dto/response-comment-of-posts.dto';

export class FindAllCommentOfBlogsCommand {
	constructor(public query: QueryCommentDto, public currentUserId: string | null) {}
}

@QueryHandler(FindAllCommentOfBlogsCommand)
export class FindAllCommentOfBlogsHandler implements IQueryHandler<FindAllCommentOfBlogsCommand> {
	constructor(
		@Inject(CommentInjectionToken.QUERY_COMMENT_REPOSITORY)
		private readonly queryCommentsRepository: QueryCommentsRepositoryInterface,
		@Inject(PostInjectionToken.QUERY_POST_REPOSITORY)
		private readonly queryPostsRepository: QueryPostsRepositoryInterface,
		private readonly paginationService: PaginationService,
	) {}

	async execute(
		command: FindAllCommentOfBlogsCommand,
	): Promise<PaginationDto<ResponseCommentOfPostsDto[]>> {
		//const searchString = { blogUserId: command.currentUserId };

		const searchString = '';

		const totalCount: number = await this.queryCommentsRepository.count(searchString);
		const paginationData: PaginationCalc = this.paginationService.pagination({
			...command.query,
			totalCount,
		});

		const comments: CommentModel[] = await this.queryCommentsRepository.findQuery(
			searchString,
			paginationData.sortBy,
			paginationData.sortDirection,
			paginationData.skip,
			paginationData.pageSize,
			command.currentUserId,
		);

		return {
			pagesCount: paginationData.pagesCount,
			page: paginationData.pageNumber,
			pageSize: paginationData.pageSize,
			totalCount: totalCount,
			items: comments.map((v: CommentModel) => {
				console.log(v);
				return {
					id: v.id.toString(),
					content: v.content,
					createdAt: v.createdAt,
					likesInfo: {
						likesCount: +v.likes,
						dislikesCount: +v.dislikes,
						myStatus: v.status ? LikeStatusEnum[v.status] : LikeStatusEnum.None,
					},
					commentatorInfo: {
						userId: v.userId.toString(),
						userLogin: v.login,
					},
					postInfo: {
						id: v.postId.toString(),
						title: v.title,
						blogId: v.blogId.toString(),
						blogName: v.name,
					},
				};
			}),
		};
	}
}
