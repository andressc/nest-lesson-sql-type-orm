import { SessionModel } from '../domain/session.schema';
import { MainRepositoryInterface } from '../../shared/interfaces/main.repository.interface';
import { CreateSessionDto } from '../dto/create-session.dto';

/* eslint-disable */
export interface SessionsRepositoryInterface
	extends MainRepositoryInterface<SessionModel, CreateSessionDto> {
	findSession(
		userId: string,
		deviceId: string,
		lastActiveDate: string,
	): Promise<SessionModel | null>;
	update(
		lastActiveDate: string,
		expirationDate: string,
		ip: string,
		userAgent: string,
		sessionId: string,
	): Promise<void>
	findSessionOnDeviceId(deviceId: string): Promise<SessionModel | null>;
	removeAllUserSessionsExceptCurrent(userId: string, deviceId: string): Promise<void>;
	removeAllUserSessions(userId: string): Promise<void>;
}
