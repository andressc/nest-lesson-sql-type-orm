import { Provider } from '@nestjs/common';
import { SessionInjectionToken } from './session.injection.token';
import { SessionsRepository } from '../repository/sessions.repository';

export const SessionsRepositoryProvider: Provider = {
	provide: SessionInjectionToken.SESSION_REPOSITORY,
	useClass: SessionsRepository,
};
