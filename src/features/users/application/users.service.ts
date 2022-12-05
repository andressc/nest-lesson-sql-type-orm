import { Inject, Injectable } from '@nestjs/common';
import {
	UserExistsEmailException,
	UserExistsLoginException,
	UserNotFoundException,
} from '../../../common/exceptions';
import { UserModel } from '../domain/user.schema';
import { UsersRepositoryInterface } from '../interfaces/users.repository.interface';
import { UserInjectionToken } from '../infrastructure/providers/user.injection.token';

@Injectable()
export class UsersService {
	constructor(
		@Inject(UserInjectionToken.USER_REPOSITORY)
		private readonly usersRepository: UsersRepositoryInterface,
	) {}

	public async findUserByIdOrErrorThrow(id: string): Promise<UserModel> {
		const user: UserModel | null = await this.usersRepository.find(id);
		if (!user) throw new UserNotFoundException(id);
		return user;
	}

	public async findUserByLoginOrErrorThrow(login: string): Promise<UserModel> {
		const user: UserModel | null = await this.usersRepository.findUserByLogin(login);
		if (user) throw new UserExistsLoginException(login);
		return user;
	}

	public async findUserByEmailOrErrorThrow(email: string): Promise<UserModel> {
		const user: UserModel | null = await this.usersRepository.findUserByEmail(email);
		if (user) throw new UserExistsEmailException(email);
		return user;
	}
}
