import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ObjectIdDto } from '../../../common/dto';
import { GuestGuard } from '../../../common/guards';
import { QueryBlogDto } from '../dto';
import { QueryPostDto } from '../../posts/dto';
import { CurrentuserIdNonAuthorized } from '../../../common/decorators/Param';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { FindOneBlogCommand } from '../application/queries/find-one-blog.handler';
import { FindAllBlogCommand } from '../application/queries/find-all-blog.handler';
import { FindAllPostCommand } from '../../posts/application/queries/find-all-post.handler';

@Controller('blogs')
export class BlogsController {
	constructor(private readonly commandBus: CommandBus, private readonly queryBus: QueryBus) {}

	@Get()
	findAllBlogs(@Query() query: QueryBlogDto) {
		return this.queryBus.execute(new FindAllBlogCommand(query));
	}

	@Get(':id/posts')
	@UseGuards(GuestGuard)
	findAllPostsOfBlog(
		@Query() query: QueryPostDto,
		@Param() param: ObjectIdDto,
		@CurrentuserIdNonAuthorized() currentuserId: ObjectIdDto | null,
	) {
		return this.queryBus.execute(new FindAllPostCommand(query, currentuserId.id, param.id));
	}

	@Get(':id')
	findOneBlog(@Param() param: ObjectIdDto) {
		return this.queryBus.execute(new FindOneBlogCommand(param.id));
	}

	/*@UseGuards(BasicAuthGuard)
	@Post()
	async createBlog(@Body() data: CreateBlogDto) {
		const blogId = await this.commandBus.execute(new CreateBlogCommand(data));
		return this.queryBus.execute(new FindOneBlogCommand(blogId));
	}

	@UseGuards(BasicAuthGuard)
	@Post(':id/posts')
	async createPostOfBlog(
		@Body() data: CreatePostOfBlogDto,
		@Param() param: ObjectIdDto,
		@CurrentuserIdNonAuthorized() currentuserId,
	) {
		const postId = await this.commandBus.execute(new CreatePostOfBlogCommand(data, param.id));
		return this.queryBus.execute(new FindOnePostCommand(postId, currentuserId));
	}

	@HttpCode(204)
	@UseGuards(BasicAuthGuard)
	@Put(':id')
	async updateBlog(@Param() param: ObjectIdDto, @Body() data: UpdateBlogDto) {
		await this.commandBus.execute(new UpdateBlogCommand(param.id, data));
	}

	@HttpCode(204)
	@UseGuards(BasicAuthGuard)
	@Delete(':id')
	async removeBlog(@Param() param: ObjectIdDto) {
		await this.commandBus.execute(new RemoveBlogCommand(param.id));
	}*/
}
