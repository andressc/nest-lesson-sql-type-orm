import { Provider } from '@nestjs/common';
import { PostInjectionToken } from './post.injection.token';
import { PostsRepository } from '../repository/posts.repository';

export const PostsRepositoryProvider: Provider = {
	provide: PostInjectionToken.POST_REPOSITORY,
	useClass: PostsRepository,
};
