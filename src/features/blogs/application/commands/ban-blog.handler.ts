import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsService } from '../blogs.service';
import { BlogModel } from '../../domain/blog.schema';
import { ValidationService } from '../../../../shared/validation/application/validation.service';
import { BlogsRepositoryInterface } from '../../interfaces/blogs.repository.interface';
import { Inject } from '@nestjs/common';
import { BlogInjectionToken } from '../../infrastructure/providers/blog.injection.token';
import { BanBlogDto } from '../../dto/ban-blog.dto';
import { BanUnbanPostCommand } from '../../../posts/application/commands/ban-unban-post.handler';

export class BanBlogCommand {
	constructor(public id: string, public data: BanBlogDto) {}
}

@CommandHandler(BanBlogCommand)
export class BanBlogHandler implements ICommandHandler<BanBlogCommand> {
	constructor(
		@Inject(BlogInjectionToken.BLOG_REPOSITORY)
		private readonly blogsRepository: BlogsRepositoryInterface,
		private readonly blogsService: BlogsService,
		private readonly validationService: ValidationService,
		private readonly commandBus: CommandBus,
	) {}

	async execute(command: BanBlogCommand): Promise<void> {
		let banDate = null;

		await this.validationService.validate(command.data, BanBlogDto);

		const blog: BlogModel = await this.blogsService.findBlogOrErrorThrow(command.id);

		if (command.data.isBanned) banDate = new Date().toISOString();

		await this.blogsRepository.banBlog(command.data.isBanned, banDate, blog.id);

		await this.commandBus.execute(new BanUnbanPostCommand(blog.id, command.data.isBanned));
	}
}
