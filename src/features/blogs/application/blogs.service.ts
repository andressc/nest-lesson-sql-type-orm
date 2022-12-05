import { Inject, Injectable } from '@nestjs/common';
import { BlogNotFoundException } from '../../../common/exceptions';
import { BlogModel } from '../domain/blog.schema';
import { BlogsRepositoryInterface } from '../interfaces/blogs.repository.interface';
import { BlogInjectionToken } from '../infrastructure/providers/blog.injection.token';

@Injectable()
export class BlogsService {
	constructor(
		@Inject(BlogInjectionToken.BLOG_REPOSITORY)
		private readonly blogsRepository: BlogsRepositoryInterface,
	) {}

	public async findBlogOrErrorThrow(id: string): Promise<BlogModel> {
		const blog: BlogModel | null = await this.blogsRepository.find(id);
		if (!blog) throw new BlogNotFoundException(id);
		return blog;
	}
}
