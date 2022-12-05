import { Provider } from '@nestjs/common';
import { UserInjectionToken } from './user.injection.token';
import { QueryUsersRepository } from '../query/query-users.repository';

export const QueryUsersRepositoryProvider: Provider = {
	provide: UserInjectionToken.QUERY_USER_REPOSITORY,
	useClass: QueryUsersRepository,
};
