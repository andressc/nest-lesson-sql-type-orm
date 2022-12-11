import {
	Body,
	Controller,
	Get,
	HttpCode,
	Param,
	ParseIntPipe,
	Put,
	Query,
	UseGuards,
} from '@nestjs/common';

import { AccessTokenGuard } from '../../../common/guards';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { BanUnbanBlogOfUserDto } from '../../blogs/dto/ban-unban-blog-of-user.dto';
import { CurrentUserId } from '../../../common/decorators/Param';
import { BanUnbanBlogOfUserCommand } from '../../blogs/application/commands/ban-unban-blog-of-user.handler';
import { QueryBlogDto } from '../../blogs/dto';
import { FindAllBannedBlogOfUserCommand } from '../../blogs/application/queries/find-all-banned-blog-of-user.handler';

@Controller('blogger/users')
@UseGuards(AccessTokenGuard)
export class BloggerUsersController {
	constructor(private readonly commandBus: CommandBus, private readonly queryBus: QueryBus) {}

	@HttpCode(204)
	@Put(':id/ban')
	async banUnbanUser(
		@Param('id', new ParseIntPipe({ errorHttpStatusCode: 404 })) id: string,
		@Body() data: BanUnbanBlogOfUserDto,
		@CurrentUserId() currentUserId,
	) {
		await this.commandBus.execute(new BanUnbanBlogOfUserCommand(id, data, currentUserId));
	}

	@Get('blog/:id')
	findAllBannedUsersOfBlog(
		@Param('id', new ParseIntPipe({ errorHttpStatusCode: 404 })) id: string,
		@Query() query: QueryBlogDto,
		@CurrentUserId() currentUserId,
	) {
		return this.queryBus.execute(new FindAllBannedBlogOfUserCommand(id, query, currentUserId));
	}
}
