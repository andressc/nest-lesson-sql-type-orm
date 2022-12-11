import { PostModel } from '../../domain/post.schema';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsService } from '../posts.service';
import { PostsRepositoryInterface } from '../../interfaces/posts.repository.interface';
import { ForbiddenException, Inject } from '@nestjs/common';
import { PostInjectionToken } from '../../infrastructure/providers/post.injection.token';
import { BlogModel } from '../../../blogs/domain/blog.schema';
import { BlogsService } from '../../../blogs/application/blogs.service';

export class RemovePostCommand {
	constructor(public blogId: string, public postId: string, public currentUserId: string) {}
}

@CommandHandler(RemovePostCommand)
export class RemovePostHandler implements ICommandHandler<RemovePostCommand> {
	constructor(
		@Inject(PostInjectionToken.POST_REPOSITORY)
		private readonly postsRepository: PostsRepositoryInterface,
		private readonly postsService: PostsService,
		private readonly blogsService: BlogsService,
	) {}

	async execute(command: RemovePostCommand): Promise<void> {
		const blog: BlogModel = await this.blogsService.findBlogOrErrorThrow(command.blogId);
		if (blog.userId !== command.currentUserId) throw new ForbiddenException();

		const post: PostModel = await this.postsService.findPostOrErrorThrow(command.postId);
		await this.postsRepository.delete(post);
	}
}
