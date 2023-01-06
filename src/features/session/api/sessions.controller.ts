import { Controller, Delete, Get, HttpCode, Inject, Param, UseGuards } from '@nestjs/common';
import { RefreshTokenGuard } from '../../../common/guards';
import { RefreshTokenDataDto } from '../../auth/dto';
import { StringIdDto } from '../../../common/dto';
import { RefreshTokenData } from '../../../common/decorators/Param';
import { CommandBus } from '@nestjs/cqrs';
import { RemoveAllUserSessionCommand } from '../application/commands/remove-all-user-session.handler';
import { RemoveUserSessionCommand } from '../application/commands/remove-user-session.handler';
import { SessionInjectionToken } from '../infrastructure/providers/session.injection.token';
import { QuerySessionsRepositoryInterface } from '../interfaces/query.sessions.repository.interface';

@Controller('security')
export class SessionsController {
	constructor(
		private readonly commandBus: CommandBus,
		@Inject(SessionInjectionToken.QUERY_SESSION_REPOSITORY)
		private readonly querySessionRepository: QuerySessionsRepositoryInterface,
	) {}

	@UseGuards(RefreshTokenGuard)
	@Get('/devices')
	findAllSessions(
		@RefreshTokenData()
		refreshTokenData: RefreshTokenDataDto,
	) {
		return this.querySessionRepository.findAllSessionsByUserId(refreshTokenData.userId);
	}

	@HttpCode(204)
	@UseGuards(RefreshTokenGuard)
	@Delete('/devices')
	async removeAllUserSessions(
		@RefreshTokenData()
		refreshTokenData: RefreshTokenDataDto,
	) {
		await this.commandBus.execute(
			new RemoveAllUserSessionCommand(refreshTokenData.userId, refreshTokenData.deviceId),
		);
	}

	@HttpCode(204)
	@UseGuards(RefreshTokenGuard)
	@Delete('/devices/:id')
	async removeUserSession(
		@Param() param: StringIdDto,
		@RefreshTokenData()
		refreshTokenData: RefreshTokenDataDto,
	) {
		await this.commandBus.execute(new RemoveUserSessionCommand(refreshTokenData.userId, param.id));
	}
}
