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
import { ObjectIdDto, QueryDto } from '../../../common/dto';
import { AccessTokenGuard } from '../../../common/guards';
import { CreateBlogDto, QueryBlogDto, UpdateBlogDto } from '../dto';
import { CreatePostOfBlogDto } from '../../posts/dto';
import { CurrentuserId, CurrentUserLogin } from '../../../common/decorators/Param';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { FindOneBlogCommand } from '../application/queries/find-one-blog.handler';
import { FindAllBlogCommand } from '../application/queries/find-all-blog.handler';
import { CreatePostOfBlogCommand } from '../../posts/application/commands/create-post-of-blog.handler';
import { FindOnePostCommand } from '../../posts/application/queries/find-one-post.handler';
import { UpdateBlogCommand } from '../application/commands/update-blog.handler';
import { CreateBlogCommand } from '../application/commands/create-blog.handler';
import { RemoveBlogCommand } from '../application/commands/remove-blog.handler';
import { UpdatePostOfBlogDto } from '../../posts/dto/update-post-of-blog.dto';
import { UpdatePostCommand } from '../../posts/application/commands/update-post.handler';
import { ObjectIdsDto } from '../../../common/dto/object-ids.dto';
import { RemovePostCommand } from '../../posts/application/commands/remove-post.handler';
import { FindAllCommentOfBlogsCommand } from '../../comments/application/queries/find-all-comment-of-blogs.handler';

@Controller('blogger/blogs')
@UseGuards(AccessTokenGuard)
export class BloggerBlogsController {
	constructor(private readonly commandBus: CommandBus, private readonly queryBus: QueryBus) {}

	@Get()
	findAllBlogs(@Query() query: QueryBlogDto, @CurrentuserId() currentuserId) {
		return this.queryBus.execute(new FindAllBlogCommand(query, currentuserId));
	}

	@Get('comments')
	findAllCommentsOfPosts(@Query() query: QueryDto, @CurrentuserId() currentuserId) {
		return this.queryBus.execute(new FindAllCommentOfBlogsCommand(query, currentuserId));
	}

	@Post()
	async createBlog(
		@Body() data: CreateBlogDto,
		@CurrentuserId() currentuserId,
		@CurrentUserLogin() currentUserLogin,
	) {
		const blogId = await this.commandBus.execute(
			new CreateBlogCommand(data, currentuserId, currentUserLogin),
		);
		return this.queryBus.execute(new FindOneBlogCommand(blogId));
	}

	@Post(':id/posts')
	async createPostOfBlog(
		@Body() data: CreatePostOfBlogDto,
		@Param() param: ObjectIdDto,
		@CurrentuserId() currentuserId,
	) {
		const postId = await this.commandBus.execute(
			new CreatePostOfBlogCommand(data, param.id, currentuserId),
		);
		return this.queryBus.execute(new FindOnePostCommand(postId, currentuserId));
	}

	@HttpCode(204)
	@Put(':id')
	async updateBlog(
		@Param() param: ObjectIdDto,
		@Body() data: UpdateBlogDto,
		@CurrentuserId() currentuserId,
	) {
		await this.commandBus.execute(new UpdateBlogCommand(param.id, data, currentuserId));
	}

	@HttpCode(204)
	@Delete(':id')
	async removeBlog(@Param() param: ObjectIdDto, @CurrentuserId() currentuserId) {
		await this.commandBus.execute(new RemoveBlogCommand(param.id, currentuserId));
	}

	@HttpCode(204)
	@Put(':blogId/posts/:postId')
	async updatePost(
		@Param() param: ObjectIdsDto,
		@Body() data: UpdatePostOfBlogDto,
		@CurrentuserId() currentuserId,
	) {
		await this.commandBus.execute(
			new UpdatePostCommand(param.blogId, param.postId, data, currentuserId),
		);
	}

	@HttpCode(204)
	@Delete(':blogId/posts/:postId')
	async removePost(@Param() param: ObjectIdsDto, @CurrentuserId() currentuserId) {
		await this.commandBus.execute(new RemovePostCommand(param.blogId, param.postId, currentuserId));
	}
}
