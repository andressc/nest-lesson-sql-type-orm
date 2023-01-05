import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NewPasswordDto } from '../../dto';
import { UserNotFoundException } from '../../../../common/exceptions';
import { UserModel } from '../../../users/domain/user.schema';
import { UsersRepositoryInterface } from '../../../users/interfaces/users.repository.interface';
import { Inject } from '@nestjs/common';
import { UserInjectionToken } from '../../../users/infrastructure/providers/user.injection.token';

export class NewPasswordAuthCommand {
	constructor(public data: NewPasswordDto, public userId: string) {}
}

@CommandHandler(NewPasswordAuthCommand)
export class NewPasswordAuthHandler implements ICommandHandler<NewPasswordAuthCommand> {
	constructor(
		@Inject(UserInjectionToken.USER_REPOSITORY)
		private readonly usersRepository: UsersRepositoryInterface,
	) {}

	async execute(command: NewPasswordAuthCommand): Promise<void> {
		const user: UserModel | null = await this.usersRepository.find(command.userId);
		if (!user) throw new UserNotFoundException(command.userId);

		await this.usersRepository.updatePassword(command.data.newPassword, user.id);
	}
}
