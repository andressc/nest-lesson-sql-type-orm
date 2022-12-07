import { SessionModel } from '../domain/session.schema';

export interface QuerySessionsRepositoryInterface {
	findAllSessionsByuserId(currentuserId: string): Promise<SessionModel[]>;
}
