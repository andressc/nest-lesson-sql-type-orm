import { Provider } from '@nestjs/common';
import { UserInjectionToken } from './user.injection.token';
import { UsersRepository } from '../repository/users.repository';

export const UsersRepositoryProvider: Provider = {
	provide: UserInjectionToken.USER_REPOSITORY,
	useClass: UsersRepository,
};
