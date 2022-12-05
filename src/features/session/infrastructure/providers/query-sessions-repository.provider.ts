import { Provider } from '@nestjs/common';
import { SessionInjectionToken } from './session.injection.token';
import { QuerySessionsRepository } from '../query/query-sessions.repository';

export const QuerySessionsRepositoryProvider: Provider = {
	provide: SessionInjectionToken.QUERY_SESSION_REPOSITORY,
	useClass: QuerySessionsRepository,
};
