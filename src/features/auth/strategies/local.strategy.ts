import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { CommandBus } from '@nestjs/cqrs';
import { ValidateUserAuthCommand } from '../application/commands/validate-user-auth.handler';
import { UserModel } from '../../users/domain/user.schema';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
	constructor(private readonly commandBus: CommandBus) {
		super({
			usernameField: 'loginOrEmail',
		});
	}

	async validate(username: string, password: string) {
		const user: UserModel | null = await this.commandBus.execute(
			new ValidateUserAuthCommand(username, password),
		);
		//await this.authService.validateUser(username, password);
		if (!user) throw new UnauthorizedException();

		if (!user.isConfirmed) throw new UnauthorizedException();
		if (user.isBanned) throw new UnauthorizedException();

		return { userId: user.id };
	}
}
