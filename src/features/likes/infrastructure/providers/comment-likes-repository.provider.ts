import { Provider } from '@nestjs/common';
import { LikeInjectionToken } from './like.injection.token';
import { CommentLikesRepository } from '../repository/comment.likes.repository';

export const CommentLikesRepositoryProvider: Provider = {
	provide: LikeInjectionToken.COMMENT_LIKE_REPOSITORY,
	useClass: CommentLikesRepository,
};
