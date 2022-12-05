import { Provider } from '@nestjs/common';
import { PostInjectionToken } from './post.injection.token';
import { QueryPostsRepository } from '../query/query-posts.repository';

export const QueryPostsRepositoryProvider: Provider = {
	provide: PostInjectionToken.QUERY_POST_REPOSITORY,
	useClass: QueryPostsRepository,
};
