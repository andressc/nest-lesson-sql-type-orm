import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UserNotFoundException } from '../../../../common/exceptions';
import { ResponseUserDto } from '../../dto';
import { UserModel } from '../../domain/user.schema';
import { QueryUsersRepositoryInterface } from '../../interfaces/query.users.repository.interface';
import { ObjectId } from 'mongodb';
import { Inject } from '@nestjs/common';
import { UserInjectionToken } from '../../infrastructure/providers/user.injection.token';

export class FindOneUserCommand {
	constructor(public id: string) {}
}

@QueryHandler(FindOneUserCommand)
export class FindOneUserHandler implements IQueryHandler<FindOneUserCommand> {
	constructor(
		@Inject(UserInjectionToken.QUERY_USER_REPOSITORY)
		private readonly queryUsersRepository: QueryUsersRepositoryInterface,
	) {}

	async execute(command: FindOneUserCommand): Promise<ResponseUserDto> {
		const user: UserModel | null = await this.queryUsersRepository.find(new ObjectId(command.id));
		if (!user) throw new UserNotFoundException(command.id);

		return {
			id: user._id,
			login: user.login,
			email: user.email,
			createdAt: user.createdAt,
			banInfo: {
				isBanned: user.isBanned,
				banDate: user.banDate,
				banReason: user.banReason,
			},
		};
	}
}
