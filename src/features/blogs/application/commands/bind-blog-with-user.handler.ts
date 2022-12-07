import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsService } from '../blogs.service';
import { BlogModel } from '../../domain/blog.schema';
import { BlogsRepositoryInterface } from '../../interfaces/blogs.repository.interface';
import { BadRequestException, Inject } from '@nestjs/common';
import { BlogInjectionToken } from '../../infrastructure/providers/blog.injection.token';
import { UsersService } from '../../../users/application/users.service';
import { UserModel } from '../../../users/domain/user.schema';

export class BindBlogWithUserCommand {
	constructor(public userId: string, public blogId: string) {}
}

@CommandHandler(BindBlogWithUserCommand)
export class BindBlogWithUserHandler implements ICommandHandler<BindBlogWithUserCommand> {
	constructor(
		@Inject(BlogInjectionToken.BLOG_REPOSITORY)
		private readonly blogsRepository: BlogsRepositoryInterface,
		private readonly blogsService: BlogsService,
		private readonly usersService: UsersService,
	) {}

	async execute(command: BindBlogWithUserCommand): Promise<void> {
		const blog: BlogModel = await this.blogsService.findBlogOrErrorThrow(command.blogId);
		const user: UserModel = await this.usersService.findUserByIdOrErrorThrow(command.userId);

		if (blog.userId) throw new BadRequestException();

		await this.blogsRepository.bindBlogWithUser(command.userId, user.login, blog.id);
	}
}
