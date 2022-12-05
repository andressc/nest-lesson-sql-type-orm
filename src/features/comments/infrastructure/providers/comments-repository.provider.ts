import { Provider } from '@nestjs/common';
import { CommentInjectionToken } from './comment.injection.token';
import { CommentsRepository } from '../repository/comments.repository';

export const CommentsRepositoryProvider: Provider = {
	provide: CommentInjectionToken.COMMENT_REPOSITORY,
	useClass: CommentsRepository,
};
