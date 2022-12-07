import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { deviceIdNotFoundException } from '../../../../common/exceptions';
import { ForbiddenException, Inject } from '@nestjs/common';
import { SessionModel } from '../../domain/session.schema';
import { SessionsRepositoryInterface } from '../../interfaces/sessions.repository.interface';
import { SessionInjectionToken } from '../../infrastructure/providers/session.injection.token';

export class RemoveUserSessionCommand implements ICommand {
	constructor(public userId: string, public deviceId: string) {}
}

@CommandHandler(RemoveUserSessionCommand)
export class RemoveUserSessionHandler implements ICommandHandler<RemoveUserSessionCommand> {
	constructor(
		@Inject(SessionInjectionToken.SESSION_REPOSITORY)
		private readonly sessionsRepository: SessionsRepositoryInterface,
	) {}

	async execute(command: RemoveUserSessionCommand): Promise<void> {
		const session: SessionModel | null = await this.sessionsRepository.findSessionOndeviceId(
			command.deviceId,
		);
		if (!session) throw new deviceIdNotFoundException(command.deviceId);
		if (session.userId !== command.userId) throw new ForbiddenException();

		await this.sessionsRepository.delete(session);
	}
}
