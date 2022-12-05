import { Provider } from '@nestjs/common';
import { LikeInjectionToken } from './like.injection.token';
import { LikesRepository } from '../repository/likes.repository';

export const LikesRepositoryProvider: Provider = {
	provide: LikeInjectionToken.LIKE_REPOSITORY,
	useClass: LikesRepository,
};
