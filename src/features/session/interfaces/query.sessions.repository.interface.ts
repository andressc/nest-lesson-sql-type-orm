import { ResponseSessionDto } from '../dto/response-session.dto';

export interface QuerySessionsRepositoryInterface {
	findAllSessionsByUserId(currentUserId: string): Promise<ResponseSessionDto[]>;
}
