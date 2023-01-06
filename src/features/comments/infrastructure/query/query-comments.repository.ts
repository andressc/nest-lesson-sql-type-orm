import { Inject, Injectable } from '@nestjs/common';
import { CommentModel } from '../../domain/comment.schema';
import { QueryCommentsRepositoryInterface } from '../../interfaces/query.comments.repository.interface';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { QueryCommentDto, ResponseCommentDto } from '../../dto';
import { LikeStatusEnum, PaginationCalc, PaginationDto } from '../../../../common/dto';
import { ResponseCommentOfPostsDto } from '../../dto/response-comment-of-posts.dto';
import { PaginationService } from '../../../../shared/pagination/application/pagination.service';
import { ResponsePostDto } from '../../../posts/dto';
import { CommentNotFoundException, PostNotFoundException } from '../../../../common/exceptions';
import { PostInjectionToken } from '../../../posts/infrastructure/providers/post.injection.token';
import { QueryPostsRepositoryInterface } from '../../../posts/interfaces/query.posts.repository.interface';

@Injectable()
export class QueryCommentsRepository implements QueryCommentsRepositoryInterface {
	constructor(
		@InjectDataSource() protected dataSource: DataSource,
		private readonly paginationService: PaginationService,
		@Inject(PostInjectionToken.QUERY_POST_REPOSITORY)
		private readonly queryPostsRepository: QueryPostsRepositoryInterface,
	) {}

	async findAllCommentsOfBlogs(
		query: QueryCommentDto,
		currentUserId: string | null,
	): Promise<PaginationDto<ResponseCommentOfPostsDto[]>> {
		const searchString = '';

		const totalCount: number = await this.count(searchString);
		const paginationData: PaginationCalc = this.paginationService.pagination({
			...query,
			totalCount,
		});

		const comments: CommentModel[] = await this.findQuery(
			searchString,
			paginationData.sortBy,
			paginationData.sortDirection,
			paginationData.skip,
			paginationData.pageSize,
			currentUserId,
		);

		return {
			pagesCount: paginationData.pagesCount,
			page: paginationData.pageNumber,
			pageSize: paginationData.pageSize,
			totalCount: totalCount,
			items: comments.map((v: CommentModel) => {
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

	async findAllCommentsOfPost(
		query: QueryCommentDto,
		postId: string,
		currentUserId: string | null,
	): Promise<PaginationDto<ResponseCommentDto[]>> {
		const searchString = QueryCommentsRepository.searchTerm(postId);

		const post: ResponsePostDto | null = await this.queryPostsRepository.findPostById(
			postId,
			currentUserId,
		);
		if (!post) throw new PostNotFoundException(postId);

		const totalCount: number = await this.count(searchString);
		const paginationData: PaginationCalc = this.paginationService.pagination({
			...query,
			totalCount,
		});

		const comments: CommentModel[] = await this.findQuery(
			searchString,
			paginationData.sortBy,
			paginationData.sortDirection,
			paginationData.skip,
			paginationData.pageSize,
			currentUserId,
		);

		return {
			pagesCount: paginationData.pagesCount,
			page: paginationData.pageNumber,
			pageSize: paginationData.pageSize,
			totalCount: totalCount,
			items: comments.map((v: CommentModel) => {
				return {
					id: v.id.toString(),
					content: v.content,
					userId: v.userId.toString(),
					userLogin: v.login,
					createdAt: v.createdAt,
					likesInfo: {
						likesCount: +v.likes,
						dislikesCount: +v.dislikes,
						myStatus: v.status ? LikeStatusEnum[v.status] : LikeStatusEnum.None,
					},
				};
			}),
		};
	}

	async findCommentById(id: string, currentUserId: string | null): Promise<ResponseCommentDto> {
		const comment: CommentModel | null = await this.find(id, currentUserId);
		if (!comment) throw new CommentNotFoundException(id);

		return {
			id: comment.id.toString(),
			content: comment.content,
			userId: comment.userId.toString(),
			userLogin: comment.login,
			createdAt: comment.createdAt,
			likesInfo: {
				likesCount: +comment.likes,
				dislikesCount: +comment.dislikes,
				myStatus: comment.status ? LikeStatusEnum[comment.status] : LikeStatusEnum.None,
			},
		};
	}

	private async find(id: string, currentUserId: string): Promise<CommentModel | null> {
		const comment = await this.dataSource.query(
			`SELECT
				 c."id",
				 c."content",
				 c."userId",
				 c."postId",
				 c."blogId",
				 c."createdAt",
				 c."isBanned",
				 b."name",
				 p."title",
				 l."userId" as likeUserId,
				 l."likeStatus",
				 l."addedAt" AS "likeAddedAt",
				 u."login",
				 (SELECT COUNT(l."id") FROM "CommentLikes" l WHERE c."id" = l."commentId" AND l."isBanned"=false AND l."likeStatus" = 'Like') AS likes,
				 (SELECT COUNT(l."id") FROM "CommentLikes" l WHERE c."id" = l."commentId" AND l."isBanned"=false AND l."likeStatus" = 'Dislike') AS dislikes,
				 (SELECT l."likeStatus" FROM "CommentLikes" l WHERE l."userId" = ${currentUserId} AND l."isBanned"=false AND l."commentId" = c."id") AS status
			 FROM "Comments" c
			     LEFT JOIN "CommentLikes" l
			         ON c."id" = l."commentId"
					 LEFT JOIN "Blogs" b
							 ON c."blogId" = b."id"
					 LEFT JOIN "Posts" p
							 ON c."postId" = p."id"
					 LEFT JOIN "Users" u
							 ON c."userId" = u."id"
			 WHERE c."id"=$1 AND c."isBanned"=$2`,
			[id, false],
		);

		if (comment.length === 0) return null;

		return {
			id: comment[0].id,
			content: comment[0].content,
			userId: comment[0].userId,
			login: comment[0].login,
			postId: comment[0].postId,
			title: comment[0].title,
			blogId: comment[0].blogId,
			name: comment[0].name,
			createdAt: comment[0].createdAt,
			isBanned: comment[0].isBanned,
			likes: comment[0].likes,
			dislikes: comment[0].dislikes,
			status: comment[0].status,
		};
	}

	private async findQuery(
		searchString: string,
		sortBy: any,
		sortDirection: string,
		skip: number,
		pageSize: number,
		currentUserId: string | null,
	): Promise<CommentModel[] | null> {
		const order = `"${sortBy}" ${sortDirection}`;

		return await this.dataSource.query(
			`SELECT
				 c."id",
				 c."content",
				 c."userId",
				 c."postId",
				 c."blogId",
				 c."createdAt",
				 c."isBanned",
				 b."name",
				 p."title",
				 u."login",
				 (SELECT COUNT(l."id") FROM "CommentLikes" l WHERE c."id" = l."commentId" AND l."isBanned"=false AND l."likeStatus" = 'Like') AS likes,
				 (SELECT COUNT(l."id") FROM "CommentLikes" l WHERE c."id" = l."commentId" AND l."isBanned"=false AND l."likeStatus" = 'Dislike') AS dislikes,
				 (SELECT l."likeStatus" FROM "CommentLikes" l WHERE l."userId" = ${currentUserId} AND l."isBanned"=false AND l."commentId" = c."id") AS status 
			 FROM "Comments" c
			     LEFT JOIN "Blogs" b
							 ON c."blogId" = b."id"
					 LEFT JOIN "Posts" p
							 ON c."postId" = p."id"
					 LEFT JOIN "Users" u
							 ON c."userId" = u."id"
			 WHERE c."isBanned"=$1 ${searchString} ORDER BY ${order} LIMIT $2 OFFSET $3`,
			[false, pageSize, skip],
		);
	}

	private async count(searchString: string): Promise<number> {
		const count = await this.dataSource.query(
			`SELECT COUNT(id) FROM "Comments" WHERE "isBanned"=false ${searchString}`,
		);
		return +count[0].count;
	}

	private static searchTerm(postId: string | undefined): string {
		let searchString = '';

		if (postId) searchString = `AND "postId" = ${postId}`;

		return searchString;
	}
}
