import { Provider } from '@nestjs/common';
import { BlogInjectionToken } from './blog.injection.token';
import { BlogsRepository } from '../repository/blogs.repository';

export const BlogsRepositoryProvider: Provider = {
	provide: BlogInjectionToken.QUERY_BLOG_REPOSITORY,
	useClass: BlogsRepository,
};
