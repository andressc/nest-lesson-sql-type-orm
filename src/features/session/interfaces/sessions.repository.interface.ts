import { SessionModel } from '../domain/session.schema';
import { CreateSessionDto } from '../dto/create-session.dto';

export interface SessionsRepositoryInterface {
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
	): Promise<void>;
	create(data: CreateSessionDto): Promise<SessionModel>;
	find(id: string): Promise<SessionModel | null>;
	delete(model: SessionModel): Promise<void>;
	deleteAll(): Promise<void>;
	findSessionOnDeviceId(deviceId: string): Promise<SessionModel | null>;
	removeAllUserSessionsExceptCurrent(userId: string, deviceId: string): Promise<void>;
	removeAllUserSessions(userId: string): Promise<void>;
}
