import { Inject, Injectable } from '@nestjs/common';
import { PostModel } from '../../domain/post.schema';
import { QueryPostsRepositoryInterface } from '../../interfaces/query.posts.repository.interface';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { LikeStatusEnum, PaginationCalc, PaginationDto, QueryDto } from '../../../../common/dto';
import { ResponsePostDto } from '../../dto';
import { BlogModel } from '../../../blogs/domain/blog.schema';
import { BlogNotFoundException, PostNotFoundException } from '../../../../common/exceptions';
import { PaginationService } from '../../../../shared/pagination/application/pagination.service';
import { BlogInjectionToken } from '../../../blogs/infrastructure/providers/blog.injection.token';
import { BlogsRepositoryInterface } from '../../../blogs/interfaces/blogs.repository.interface';

@Injectable()
export class QueryPostsRepository implements QueryPostsRepositoryInterface {
	constructor(
		@InjectDataSource() protected dataSource: DataSource,
		@Inject(BlogInjectionToken.QUERY_BLOG_REPOSITORY)
		private readonly blogsRepository: BlogsRepositoryInterface,
		private readonly paginationService: PaginationService,
	) {}

	async findAllPosts(
		query: QueryDto,
		currentUserId: string | null,
		blogId?: string,
	): Promise<PaginationDto<ResponsePostDto[]>> {
		const searchString = QueryPostsRepository.searchTerm(blogId);
		const blog: BlogModel | null = await this.blogsRepository.find(blogId);

		if (!blog && blogId) throw new BlogNotFoundException(blogId);

		const totalCount: number = await this.count(searchString);

		const paginationData: PaginationCalc = this.paginationService.pagination({
			...query,
			totalCount,
		});

		const post: PostModel[] = await this.findQuery(
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
			items: post.map((v: PostModel) => {
				return {
					id: v.id.toString(),
					title: v.title,
					shortDescription: v.shortDescription,
					content: v.content,
					blogId: v.blogId.toString(),
					blogName: v.blogName,
					createdAt: v.createdAt,
					extendedLikesInfo: {
						likesCount: +v.likes,
						dislikesCount: +v.dislikes,
						myStatus: v.status ? LikeStatusEnum[v.status] : LikeStatusEnum.None,
						newestLikes: v.like,
					},
				};
			}),
		};
	}

	async findPostById(id: string, currentUserId: string | null): Promise<ResponsePostDto | null> {
		const post: PostModel | null = await this.find(id, currentUserId);
		if (!post) throw new PostNotFoundException(id);

		return {
			id: post.id.toString(),
			title: post.title,
			shortDescription: post.shortDescription,
			content: post.content,
			blogId: post.blogId.toString(),
			blogName: post.blogName,
			createdAt: post.createdAt,
			extendedLikesInfo: {
				likesCount: +post.likes,
				dislikesCount: +post.dislikes,
				myStatus: post.status ? LikeStatusEnum[post.status] : LikeStatusEnum.None,
				newestLikes: post.like,
			},
		};
	}

	private async find(id: string, currentUserId: string): Promise<PostModel | null> {
		const post = await this.dataSource.query(
			`SELECT
				 p."id",
				 p."title",
				 p."shortDescription",
				 p."content",
				 p."blogId",
				 p."createdAt",
				 p."isBanned",
				 b."name",
				 b."userId",
				 u."login",
				 (SELECT COUNT(l."id") FROM "PostLikes" l WHERE p."id" = l."postId" AND l."isBanned"=false AND l."likeStatus" = 'Like') AS likes,
				 (SELECT COUNT(l."id") FROM "PostLikes" l WHERE p."id" = l."postId" AND l."isBanned"=false AND l."likeStatus" = 'Dislike') AS dislikes,
				 (SELECT l."likeStatus" FROM "PostLikes" l WHERE l."userId" = ${currentUserId} AND l."isBanned"=false AND l."postId" = p."id") AS status,
				 (SELECT array_agg(l."userId" || ' ' || l."addedAt" || ' ' || u."login" ORDER BY l."addedAt" DESC) 
				  FROM "PostLikes" l, "Users" u 
				  WHERE l."likeStatus" = 'Like' AND l."isBanned"=false AND l."postId" = p."id" AND l."userId"=u."id") AS newlike
			 FROM "Posts" p
					 LEFT JOIN "Blogs" b
							 ON p."blogId" = b."id"
					 LEFT JOIN "Users" u
							 ON b."userId" = u."id"
			 WHERE p."id"=$1 AND p."isBanned"=$2 AND u."isBanned"=false`,
			[id, false],
		);

		if (post.length === 0) return null;

		const newestLikes = [];

		for (let i = 0; i < 3; i++) {
			if (post[0].newlike && post[0].newlike[i]) {
				const splitUser = post[0].newlike[i].split(' ');
				newestLikes.push({
					userId: splitUser[0].toString(),
					login: splitUser[2],
					addedAt: splitUser[1],
				});
			}
		}

		return {
			id: post[0].id,
			title: post[0].title,
			shortDescription: post[0].shortDescription,
			content: post[0].content,
			blogId: post[0].blogId,
			blogName: post[0].name,
			isBanned: post[0].isBanned,
			createdAt: post[0].createdAt,
			likes: post[0].likes,
			dislikes: post[0].dislikes,
			status: post[0].status,
			like: newestLikes,
		};
	}

	private async findQuery(
		searchString: string,
		sortBy: any,
		sortDirection: string,
		skip: number,
		pageSize: number,
		currentUserId: string,
	): Promise<PostModel[] | null> {
		let order;
		if (sortBy === 'title') order = `ORDER BY "title" ${sortDirection}`;
		if (sortBy === 'shortDescription') order = `ORDER BY "shortDescription" ${sortDirection}`;
		if (sortBy === 'content') order = `ORDER BY "content" ${sortDirection}`;
		if (sortBy === 'blogId') order = `ORDER BY "blogId" ${sortDirection}`;
		if (sortBy === 'blogName') order = `ORDER BY "name" ${sortDirection}`;
		if (sortBy === 'createdAt') order = `ORDER BY "createdAt" ${sortDirection}`;

		const result = await this.dataSource.query(
			`SELECT 
    		 p."id",
				 p."title",
				 p."shortDescription",
				 p."content",
				 p."blogId",
				 p."createdAt",
				 p."isBanned",
				 b."name",
				 b."userId",
				 u."login",
				 (SELECT COUNT(l."id") FROM "PostLikes" l WHERE p."id" = l."postId" AND l."isBanned"=false AND l."likeStatus" = 'Like') AS likes,
				 (SELECT COUNT(l."id") FROM "PostLikes" l WHERE p."id" = l."postId" AND l."isBanned"=false AND l."likeStatus" = 'Dislike') AS dislikes,
				 (SELECT l."likeStatus" FROM "PostLikes" l WHERE l."userId" = ${currentUserId} AND l."isBanned"=false AND l."postId" = p."id") AS status,
				 (SELECT array_agg(l."userId" || ' ' || l."addedAt" || ' ' || u."login" ORDER BY l."addedAt" DESC) 
				  FROM "PostLikes" l, "Users" u 
				  WHERE l."likeStatus" = 'Like' AND l."isBanned"=false AND l."postId" = p."id" AND l."userId"=u."id") AS newlike
			 FROM "Posts" p
					 LEFT JOIN "Blogs" b
					     ON p."blogId" = b."id"
					 LEFT JOIN "Users" u
					     ON b."userId" = u."id"
			 WHERE p."isBanned"=$1 AND u."isBanned"=false ${searchString} ${
				order ? order : ''
			} LIMIT $2 OFFSET $3`,
			[false, pageSize, skip],
		);

		const posts = [];

		for (const postRow of result) {
			const newestLikes = [];

			for (let i = 0; i < 3; i++) {
				if (postRow.newlike && postRow.newlike[i]) {
					const splitUser = postRow.newlike[i].split(' ');
					newestLikes.push({
						userId: splitUser[0].toString(),
						login: splitUser[2],
						addedAt: splitUser[1],
					});
				}
			}

			posts.push({
				id: postRow.id,
				title: postRow.title,
				shortDescription: postRow.shortDescription,
				content: postRow.content,
				blogId: postRow.blogId,
				blogName: postRow.name,
				createdAt: postRow.createdAt,
				isBanned: postRow.isBanned,
				likes: postRow.likes,
				dislikes: postRow.dislikes,
				status: postRow.status,
				like: newestLikes,
			});
		}

		return posts;
	}

	private async count(searchString): Promise<number> {
		const count = await this.dataSource.query(
			`SELECT COUNT(id) FROM "Posts" WHERE "isBanned"=false ${searchString}`,
		);
		return +count[0].count;
	}

	private static searchTerm(blogId: string | undefined): string {
		let searchString = '';

		if (blogId) searchString = `AND "blogId" = ${blogId}`;

		return searchString;
	}
}
