import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RegistrationEmailResendingDto } from '../../dto';
import { EmailBadRequestException } from '../../../../common/exceptions';
import { v4 as uuidv4 } from 'uuid';
import { Inject, RequestTimeoutException } from '@nestjs/common';
import { UserModel } from '../../../users/domain/user.schema';
import { ValidationService } from '../../../../shared/validation/application/validation.service';
import { SendEmailRegistrationMessageMailerCommand } from '../../../../shared/mailer/application/commands/send-email-registration-message-mailer.handler';
import { UsersRepositoryInterface } from '../../../users/interfaces/users.repository.interface';
import { UserInjectionToken } from '../../../users/infrastructure/providers/user.injection.token';

export class RegistrationEmailResendingAuthCommand {
	constructor(public data: RegistrationEmailResendingDto) {}
}

@CommandHandler(RegistrationEmailResendingAuthCommand)
export class RegistrationEmailResendingAuthHandler
	implements ICommandHandler<RegistrationEmailResendingAuthCommand>
{
	constructor(
		private readonly validationService: ValidationService,
		@Inject(UserInjectionToken.USER_REPOSITORY)
		private readonly usersRepository: UsersRepositoryInterface,
		private readonly commandBus: CommandBus,
	) {}

	async execute(command: RegistrationEmailResendingAuthCommand): Promise<void> {
		await this.validationService.validate(command.data, RegistrationEmailResendingDto);

		const user: UserModel | null = await this.usersRepository.findUserByEmail(command.data.email);

		if (!user) throw new EmailBadRequestException();
		if (user.isConfirmed) throw new EmailBadRequestException();

		const newConfirmationCode = uuidv4();
		await this.usersRepository.updateConfirmationCode(newConfirmationCode, user.id);

		try {
			await this.commandBus.execute(
				new SendEmailRegistrationMessageMailerCommand(user.email, newConfirmationCode),
			);
		} catch (e) {
			throw new RequestTimeoutException('Message not sent' + e);
		}
	}
}
