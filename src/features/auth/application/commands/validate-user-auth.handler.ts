import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, UnauthorizedException } from '@nestjs/common';
import { generateHash } from '../../../../common/helpers';
import { UserModel } from '../../../users/domain/user.schema';
import { UsersRepositoryInterface } from '../../../users/interfaces/users.repository.interface';
import { UserInjectionToken } from '../../../users/infrastructure/providers/user.injection.token';

export class ValidateUserAuthCommand {
	constructor(public login: string, public password: string) {}
}

@CommandHandler(ValidateUserAuthCommand)
export class ValidateUserAuthHandler implements ICommandHandler<ValidateUserAuthCommand> {
	constructor(
		@Inject(UserInjectionToken.USER_REPOSITORY)
		private readonly usersRepository: UsersRepositoryInterface,
	) {}

	async execute(command: ValidateUserAuthCommand): Promise<UserModel | null> {
		const user: UserModel | null = await this.usersRepository.findUserByEmailOrLogin(command.login);

		if (!user) throw new UnauthorizedException();

		const passwordHash = await generateHash(command.password, user.salt);

		if (
			user &&
			user.password === passwordHash &&
			(user.login === command.login || user.email === command.login)
		) {
			return user;
		}

		return null;
	}
}
