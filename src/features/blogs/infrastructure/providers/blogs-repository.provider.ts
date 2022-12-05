import { Provider } from '@nestjs/common';
import { BlogInjectionToken } from './blog.injection.token';
import { BlogsRepository } from '../repository/blogs.repository';

export const BlogsRepositoryProvider: Provider = {
	provide: BlogInjectionToken.BLOG_REPOSITORY,
	useClass: BlogsRepository,
};
