import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RegistrationDto } from '../../dto';
import { CreateUserCommand } from '../../../users/application/commands/create-user.handler';
import { UserNotFoundException } from '../../../../common/exceptions';
import { RequestTimeoutException } from '@nestjs/common';
import { UsersRepository } from '../../../users/infrastructure/repository';
import { UserModel } from '../../../users/entity/user.schema';
import { ValidationService } from '../../../application/validation.service';
import { SendEmailRegistrationMessageMailerCommand } from '../../../../Modules/mailer/application/commands/send-email-registration-message-mailer.handler';

export class RegistrationAuthCommand {
	constructor(public data: RegistrationDto) {}
}

@CommandHandler(RegistrationAuthCommand)
export class RegistrationAuthHandler implements ICommandHandler<RegistrationAuthCommand> {
	constructor(
		private readonly validationService: ValidationService,
		private readonly usersRepository: UsersRepository,
		private readonly commandBus: CommandBus,
	) {}

	async execute(command: RegistrationAuthCommand): Promise<void> {
		await this.validationService.validate(command.data, RegistrationDto);
		const userId: string = await this.commandBus.execute(new CreateUserCommand(command.data));

		const user: UserModel | null = await this.usersRepository.findUserModel(userId);
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
