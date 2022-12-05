import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { SessionsRepositoryInterface } from '../../interfaces/sessions.repository.interface';
import { Inject } from '@nestjs/common';
import { SessionInjectionToken } from '../../infrastructure/providers/session.injection.token';

export class RemoveAllUserSessionCommand implements ICommand {
	constructor(public userId: string, public deviceId: string) {}
}

@CommandHandler(RemoveAllUserSessionCommand)
export class RemoveAllUserSessionHandler implements ICommandHandler<RemoveAllUserSessionCommand> {
	constructor(
		@Inject(SessionInjectionToken.SESSION_REPOSITORY)
		private readonly sessionsRepository: SessionsRepositoryInterface,
	) {}

	async execute(command: RemoveAllUserSessionCommand): Promise<void> {
		await this.sessionsRepository.removeAllUserSessionsExceptCurrent(
			command.userId,
			command.deviceId,
		);
	}
}
