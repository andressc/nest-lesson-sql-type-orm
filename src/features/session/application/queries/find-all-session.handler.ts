import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ResponseSessionDto } from '../../dto/response-session.dto';
import { SessionModel } from '../../domain/session.schema';
import { QuerySessionsRepositoryInterface } from '../../interfaces/query.sessions.repository.interface';
import { Inject } from '@nestjs/common';
import { SessionInjectionToken } from '../../infrastructure/providers/session.injection.token';

export class FindAllSessionCommand {
	constructor(public currentuserId: string) {}
}

@QueryHandler(FindAllSessionCommand)
export class FindAllSessionHandler implements IQueryHandler<FindAllSessionCommand> {
	constructor(
		@Inject(SessionInjectionToken.QUERY_SESSION_REPOSITORY)
		private readonly querySessionRepository: QuerySessionsRepositoryInterface,
	) {}

	async execute(command: FindAllSessionCommand): Promise<ResponseSessionDto[]> {
		const session: SessionModel[] = await this.querySessionRepository.findAllSessionsByUserId(
			command.currentuserId,
		);

		return session.map((v: SessionModel) => ({
			ip: v.ip,
			title: v.title,
			lastActiveDate: v.lastActiveDate,
			deviceId: v.deviceId,
		}));
	}
}
