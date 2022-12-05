import { Provider } from '@nestjs/common';
import { QueryBlogsRepository } from '../query/query-blogs.repository';
import { BlogInjectionToken } from './blog.injection.token';

export const QueryBlogsRepositoryProvider: Provider = {
	provide: BlogInjectionToken.QUERY_BLOG_REPOSITORY,
	useClass: QueryBlogsRepository,
};
