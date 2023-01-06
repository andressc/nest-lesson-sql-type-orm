import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	Inject,
	Param,
	ParseIntPipe,
	Post,
	Put,
	Query,
	UseGuards,
} from '@nestjs/common';

import { CreateUserDto, QueryUserDto } from '../dto';
import { BasicAuthGuard } from '../../../common/guards';
import { CommandBus } from '@nestjs/cqrs';
import { RemoveUserCommand } from '../application/commands/remove-user.handler';
import { CreateUserCommand } from '../application/commands/create-user.handler';
import { BanUnbanUserCommand } from '../application/commands/ban-unban-user.handler';
import { BanUnbanUserDto } from '../dto/ban-unban-user.dto';
import { UserInjectionToken } from '../infrastructure/providers/user.injection.token';
import { QueryUsersRepositoryInterface } from '../interfaces/query.users.repository.interface';

@Controller('sa/users')
@UseGuards(BasicAuthGuard)
export class UsersController {
	constructor(
		private readonly commandBus: CommandBus,
		@Inject(UserInjectionToken.QUERY_USER_REPOSITORY)
		private readonly queryUsersRepository: QueryUsersRepositoryInterface,
	) {}

	@Post()
	async createUser(@Body() data: CreateUserDto) {
		const userId: string = await this.commandBus.execute(new CreateUserCommand(data, true));
		return this.queryUsersRepository.findUserById(userId);
	}

	@Get()
	findAllUsers(@Query() query: QueryUserDto) {
		return this.queryUsersRepository.findAllUsers(query);
	}

	@Get(':id')
	findUserById(@Param('id', new ParseIntPipe({ errorHttpStatusCode: 404 })) id: string) {
		return this.queryUsersRepository.findUserById(id);
	}

	@HttpCode(204)
	@Put(':id/ban')
	banUser(
		@Param('id', new ParseIntPipe({ errorHttpStatusCode: 404 })) id: string,
		@Body() data: BanUnbanUserDto,
	) {
		return this.commandBus.execute(new BanUnbanUserCommand(id, data));
	}

	@HttpCode(204)
	@Delete(':id')
	async removeUser(@Param('id', new ParseIntPipe({ errorHttpStatusCode: 404 })) id: string) {
		await this.commandBus.execute(new RemoveUserCommand(id));
	}
}
