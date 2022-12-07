import { BlogModel } from '../../domain/blog.schema';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsService } from '../blogs.service';
import { BlogsRepositoryInterface } from '../../interfaces/blogs.repository.interface';
import { ForbiddenException, Inject } from '@nestjs/common';
import { BlogInjectionToken } from '../../infrastructure/providers/blog.injection.token';

export class RemoveBlogCommand {
	constructor(public id: string, public currentuserId: string) {}
}

@CommandHandler(RemoveBlogCommand)
export class RemoveBlogHandler implements ICommandHandler<RemoveBlogCommand> {
	constructor(
		@Inject(BlogInjectionToken.BLOG_REPOSITORY)
		private readonly blogsRepository: BlogsRepositoryInterface,
		private readonly blogsService: BlogsService,
	) {}

	async execute(command: RemoveBlogCommand): Promise<void> {
		const blog: BlogModel = await this.blogsService.findBlogOrErrorThrow(command.id);

		if (blog.userId !== command.currentuserId) throw new ForbiddenException();

		await this.blogsRepository.delete(blog);
	}
}
