import { Provider } from '@nestjs/common';
import { LikeInjectionToken } from './like.injection.token';
import { PostLikesRepository } from '../repository/post.likes.repository';

export const PostLikesRepositoryProvider: Provider = {
	provide: LikeInjectionToken.LIKE_REPOSITORY,
	useClass: PostLikesRepository,
};
