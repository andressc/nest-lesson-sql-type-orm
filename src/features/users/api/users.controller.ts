import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	Param,
	Post,
	Put,
	Query,
	UseGuards,
} from '@nestjs/common';

import { CreateUserDto, QueryUserDto } from '../dto';
import { ObjectIdDto } from '../../../common/dto';
import { BasicAuthGuard } from '../../../common/guards';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { RemoveUserCommand } from '../application/commands/remove-user.handler';
import { CreateUserCommand } from '../application/commands/create-user.handler';
import { FindOneUserCommand } from '../application/queries/find-one-user.handler';
import { FindAllUserCommand } from '../application/queries/find-all-user.handler';
import { BanUnbanUserCommand } from '../application/commands/ban-unban-user.handler';
import { BanUnbanUserDto } from '../dto/ban-unban-user.dto';

@Controller('sa/users')
@UseGuards(BasicAuthGuard)
export class UsersController {
	constructor(private readonly commandBus: CommandBus, private readonly queryBus: QueryBus) {}

	@Post()
	async createUser(@Body() data: CreateUserDto) {
		const userId: string = await this.commandBus.execute(new CreateUserCommand(data, true));
		return this.queryBus.execute(new FindOneUserCommand(userId));
	}

	@Get()
	findAllUsers(@Query() query: QueryUserDto) {
		return this.queryBus.execute(new FindAllUserCommand(query));
	}

	@Get(':id')
	findUserById(@Param() param) {
		return this.queryBus.execute(new FindOneUserCommand(param.id));
	}

	@HttpCode(204)
	@Put(':id/ban')
	banUser(@Param() param: ObjectIdDto, @Body() data: BanUnbanUserDto) {
		return this.commandBus.execute(new BanUnbanUserCommand(param.id, data));
	}

	@HttpCode(204)
	@Delete(':id')
	async removeUser(@Param() param: ObjectIdDto) {
		await this.commandBus.execute(new RemoveUserCommand(param.id));
	}
}
