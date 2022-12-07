import { SessionModel } from '../domain/session.schema';

export interface QuerySessionsRepositoryInterface {
	findAllSessionsByUserId(currentUserId: string): Promise<SessionModel[]>;
}
