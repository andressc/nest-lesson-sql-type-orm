import { Provider } from '@nestjs/common';
import { CommentInjectionToken } from './comment.injection.token';
import { QueryCommentsRepository } from '../query/query-comments.repository';

export const QueryCommentsRepositoryProvider: Provider = {
	provide: CommentInjectionToken.QUERY_COMMENT_REPOSITORY,
	useClass: QueryCommentsRepository,
};
