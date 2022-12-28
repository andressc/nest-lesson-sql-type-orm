import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PostNotFoundException } from '../../../../common/exceptions';
import { ResponsePostDto } from '../../dto';
import { PostModel } from '../../domain/post.schema';
import { QueryPostsRepositoryInterface } from '../../interfaces/query.posts.repository.interface';
import { Inject } from '@nestjs/common';
import { PostInjectionToken } from '../../infrastructure/providers/post.injection.token';
import { BlogInjectionToken } from '../../../blogs/infrastructure/providers/blog.injection.token';
import { QueryBlogsRepositoryInterface } from '../../../blogs/interfaces/query.blogs.repository.interface';
import { LikeStatusEnum } from '../../../../common/dto';

export class FindOnePostCommand {
	constructor(public id: string, public currentUserId: string | null) {}
}

@QueryHandler(FindOnePostCommand)
export class FindOnePostHandler implements IQueryHandler<FindOnePostCommand> {
	constructor(
		@Inject(PostInjectionToken.QUERY_POST_REPOSITORY)
		private readonly queryPostsRepository: QueryPostsRepositoryInterface,
		@Inject(BlogInjectionToken.QUERY_BLOG_REPOSITORY)
		private readonly queryBlogsRepository: QueryBlogsRepositoryInterface,
	) {}

	async execute(command: FindOnePostCommand): Promise<ResponsePostDto | null> {
		const post: PostModel | null = await this.queryPostsRepository.find(
			command.id,
			command.currentUserId,
		);
		if (!post) throw new PostNotFoundException(command.id);

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
}
