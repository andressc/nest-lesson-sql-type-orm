import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	Param,
	ParseIntPipe,
	Post,
	Put,
	Query,
	UseGuards,
} from '@nestjs/common';

import { CreateUserDto, QueryUserDto } from '../dto';
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
	findUserById(@Param('id', new ParseIntPipe({ errorHttpStatusCode: 404 })) id: string) {
		return this.queryBus.execute(new FindOneUserCommand(id));
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
