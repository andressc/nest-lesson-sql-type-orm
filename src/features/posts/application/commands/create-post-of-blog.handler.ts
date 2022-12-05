import { createDate } from '../../../../common/helpers';
import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { CreatePostOfBlogDto } from '../../dto';
import { BlogsService } from '../../../blogs/application/blogs.service';
import { BlogModel } from '../../../blogs/domain/blog.schema';
import { ValidationService } from '../../../../shared/validation/application/validation.service';
import { PostsRepositoryInterface } from '../../interfaces/posts.repository.interface';
import { ForbiddenException, Inject } from '@nestjs/common';
import { PostInjectionToken } from '../../infrastructure/providers/post.injection.token';

export class CreatePostOfBlogCommand implements ICommand {
	constructor(
		public data: CreatePostOfBlogDto,
		public blogId: string,
		public currentUserId: string,
	) {}
}

@CommandHandler(CreatePostOfBlogCommand)
export class CreatePostOfBlogHandler implements ICommandHandler<CreatePostOfBlogCommand> {
	constructor(
		private readonly blogsService: BlogsService,
		@Inject(PostInjectionToken.POST_REPOSITORY)
		private readonly postsRepository: PostsRepositoryInterface,
		private readonly validationService: ValidationService,
	) {}

	async execute(command: CreatePostOfBlogCommand): Promise<string> {
		await this.validationService.validate(command.data, CreatePostOfBlogDto);

		const blog: BlogModel = await this.blogsService.findBlogOrErrorThrow(command.blogId);

		if (blog.userId !== command.currentUserId) throw new ForbiddenException();

		const newPost = await this.postsRepository.create({
			...command.data,
			blogId: command.blogId,
			blogName: blog.name,
			blogUserId: blog.userId,
			createdAt: createDate(),
		});

		const result = await this.postsRepository.save(newPost);
		return result.id.toString();
	}
}
