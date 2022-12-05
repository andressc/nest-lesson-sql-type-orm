import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RegistrationDto } from '../../dto';
import { CreateUserCommand } from '../../../users/application/commands/create-user.handler';
import { UserNotFoundException } from '../../../../common/exceptions';
import { Inject, RequestTimeoutException } from '@nestjs/common';
import { UserModel } from '../../../users/domain/user.schema';
import { ValidationService } from '../../../../shared/validation/application/validation.service';
import { SendEmailRegistrationMessageMailerCommand } from '../../../../shared/mailer/application/commands/send-email-registration-message-mailer.handler';
import { UsersRepositoryInterface } from '../../../users/interfaces/users.repository.interface';
import { UserInjectionToken } from '../../../users/infrastructure/providers/user.injection.token';

export class RegistrationAuthCommand {
	constructor(public data: RegistrationDto) {}
}

@CommandHandler(RegistrationAuthCommand)
export class RegistrationAuthHandler implements ICommandHandler<RegistrationAuthCommand> {
	constructor(
		private readonly validationService: ValidationService,
		@Inject(UserInjectionToken.USER_REPOSITORY)
		private readonly usersRepository: UsersRepositoryInterface,
		private readonly commandBus: CommandBus,
	) {}

	async execute(command: RegistrationAuthCommand): Promise<void> {
		await this.validationService.validate(command.data, RegistrationDto);
		const userId: string = await this.commandBus.execute(new CreateUserCommand(command.data));

		const user: UserModel | null = await this.usersRepository.find(userId);
		if (!user) throw new UserNotFoundException(userId);

		try {
			await this.commandBus.execute(
				new SendEmailRegistrationMessageMailerCommand(user.email, user.confirmationCode),
			);
		} catch (e) {
			throw new RequestTimeoutException('Message not sent' + e);
		}
	}
}
