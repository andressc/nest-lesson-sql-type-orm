import { UpdateBlogDto } from '../../dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsService } from '../blogs.service';
import { BlogModel } from '../../domain/blog.schema';
import { ValidationService } from '../../../../shared/validation/application/validation.service';
import { BlogsRepositoryInterface } from '../../interfaces/blogs.repository.interface';
import { ForbiddenException, Inject } from '@nestjs/common';
import { BlogInjectionToken } from '../../infrastructure/providers/blog.injection.token';

export class UpdateBlogCommand {
	constructor(public id: string, public data: UpdateBlogDto, public currentUserId: string) {}
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogHandler implements ICommandHandler<UpdateBlogCommand> {
	constructor(
		@Inject(BlogInjectionToken.BLOG_REPOSITORY)
		private readonly blogsRepository: BlogsRepositoryInterface,
		private readonly blogsService: BlogsService,
		private readonly validationService: ValidationService,
	) {}

	async execute(command: UpdateBlogCommand): Promise<void> {
		await this.validationService.validate(command.data, UpdateBlogDto);

		const blog: BlogModel = await this.blogsService.findBlogOrErrorThrow(command.id);
		if (blog.userId !== command.currentUserId) throw new ForbiddenException();

		await this.blogsRepository.update(command.data, blog.id);
	}
}
