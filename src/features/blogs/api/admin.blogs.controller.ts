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

import { BasicAuthGuard } from '../../../common/guards';
import { QueryBlogDto } from '../dto';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { FindAllBlogAdminCommand } from '../application/queries/find-all-blog-admin.handler';
import { BindBlogWithUserCommand } from '../application/commands/bind-blog-with-user.handler';
import { BanBlogDto } from '../dto/ban-blog.dto';
import { BanBlogCommand } from '../application/commands/ban-blog.handler';

@Controller('sa/blogs')
@UseGuards(BasicAuthGuard)
export class AdminBlogsController {
	constructor(private readonly commandBus: CommandBus, private readonly queryBus: QueryBus) {}

	@Get()
	findAllBlogs(@Query() query: QueryBlogDto) {
		return this.queryBus.execute(new FindAllBlogAdminCommand(query));
	}

	@HttpCode(204)
	@Put(':blogId/bind-with-user/:userId')
	async updateBlog(
		@Param('userId', new ParseIntPipe({ errorHttpStatusCode: 404 })) userId: string,
		@Param('blogId', new ParseIntPipe({ errorHttpStatusCode: 404 })) blogId: string,
	) {
		await this.commandBus.execute(new BindBlogWithUserCommand(userId, blogId));
	}

	@HttpCode(204)
	@Put(':id/ban')
	async banBlog(
		@Param('id', new ParseIntPipe({ errorHttpStatusCode: 404 })) id: string,
		@Body() data: BanBlogDto,
	) {
		await this.commandBus.execute(new BanBlogCommand(id, data));
	}
}
