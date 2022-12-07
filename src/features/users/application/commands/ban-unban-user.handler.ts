import { CommandBus, CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { UsersService } from '../users.service';
import { UserModel } from '../../domain/user.schema';
import { ValidationService } from '../../../../shared/validation/application/validation.service';
import { UsersRepositoryInterface } from '../../interfaces/users.repository.interface';
import { BanUnbanUserDto } from '../../dto/ban-unban-user.dto';
import { SessionsRepositoryInterface } from '../../../session/interfaces/sessions.repository.interface';
import { BanUnbanLikeCommand } from '../../../likes/application/command/ban-unban-like.handler';
import { BanUnbanCommentCommand } from '../../../comments/application/commands/ban-unban-comment.handler';
import { Inject } from '@nestjs/common';
import { SessionInjectionToken } from '../../../session/infrastructure/providers/session.injection.token';
import { UserInjectionToken } from '../../infrastructure/providers/user.injection.token';

export class BanUnbanUserCommand implements ICommand {
	constructor(public id: string, public data: BanUnbanUserDto) {}
}

@CommandHandler(BanUnbanUserCommand)
export class BanUnbanUserHandler implements ICommandHandler<BanUnbanUserCommand> {
	constructor(
		private readonly usersService: UsersService,
		@Inject(UserInjectionToken.USER_REPOSITORY)
		private readonly usersRepository: UsersRepositoryInterface,
		@Inject(SessionInjectionToken.SESSION_REPOSITORY)
		private readonly sessionsRepository: SessionsRepositoryInterface,
		private readonly validationService: ValidationService,
		private readonly commandBus: CommandBus,
	) {}

	async execute(command: BanUnbanUserCommand): Promise<void> {
		await this.validationService.validate(command.data, BanUnbanUserDto);

		const user: UserModel = await this.usersService.findUserByIdOrErrorThrow(command.id);
		await this.usersRepository.banUnbanUser(
			command.data.isBanned,
			command.data.banReason,
			new Date().toISOString(),
			user.id,
		);

		await this.commandBus.execute(new BanUnbanLikeCommand(user.id, command.data.isBanned));
		await this.commandBus.execute(new BanUnbanCommentCommand(user.id, command.data.isBanned));

		if (command.data.isBanned) await this.sessionsRepository.removeAllUserSessions(user.id);

		await this.usersRepository.save(user);
	}
}
