import { ResponseBlogDto } from '../../dto';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { BlogNotFoundException } from '../../../../common/exceptions';
import { BlogModel } from '../../domain/blog.schema';
import { QueryBlogsRepositoryInterface } from '../../interfaces/query.blogs.repository.interface';
import { Inject } from '@nestjs/common';
import { BlogInjectionToken } from '../../infrastructure/providers/blog.injection.token';

export class FindOneBlogCommand {
	constructor(public id: string) {}
}

@QueryHandler(FindOneBlogCommand)
export class FindOneBlogHandler implements IQueryHandler<FindOneBlogCommand> {
	constructor(
		@Inject(BlogInjectionToken.QUERY_BLOG_REPOSITORY)
		private readonly queryBlogsRepository: QueryBlogsRepositoryInterface,
	) {}

	async execute(command: FindOneBlogCommand): Promise<ResponseBlogDto> {
		const blog: BlogModel | null = await this.queryBlogsRepository.find(command.id);
		if (!blog) throw new BlogNotFoundException(command.id);
		if (blog.isBanned) throw new BlogNotFoundException(command.id);

		return {
			id: blog.id,
			name: blog.name,
			description: blog.description,
			websiteUrl: blog.websiteUrl,
			createdAt: blog.createdAt,
		};
	}
}
