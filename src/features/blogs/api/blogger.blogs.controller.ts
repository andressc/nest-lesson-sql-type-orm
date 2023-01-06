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
import { QueryDto } from '../../../common/dto';
import { AccessTokenGuard } from '../../../common/guards';
import { CreateBlogDto, QueryBlogDto, UpdateBlogDto } from '../dto';
import { CreatePostOfBlogDto } from '../../posts/dto';
import { CurrentUserId, CurrentUserLogin } from '../../../common/decorators/Param';
import { CommandBus } from '@nestjs/cqrs';
import { CreatePostOfBlogCommand } from '../../posts/application/commands/create-post-of-blog.handler';
import { UpdateBlogCommand } from '../application/commands/update-blog.handler';
import { CreateBlogCommand } from '../application/commands/create-blog.handler';
import { RemoveBlogCommand } from '../application/commands/remove-blog.handler';
import { UpdatePostOfBlogDto } from '../../posts/dto/update-post-of-blog.dto';
import { UpdatePostCommand } from '../../posts/application/commands/update-post.handler';
import { RemovePostCommand } from '../../posts/application/commands/remove-post.handler';
import { BlogInjectionToken } from '../infrastructure/providers/blog.injection.token';
import { QueryBlogsRepositoryInterface } from '../interfaces/query.blogs.repository.interface';
import { PostInjectionToken } from '../../posts/infrastructure/providers/post.injection.token';
import { QueryPostsRepositoryInterface } from '../../posts/interfaces/query.posts.repository.interface';
import { CommentInjectionToken } from '../../comments/infrastructure/providers/comment.injection.token';
import { QueryCommentsRepositoryInterface } from '../../comments/interfaces/query.comments.repository.interface';

@Controller('blogger/blogs')
@UseGuards(AccessTokenGuard)
export class BloggerBlogsController {
	constructor(
		private readonly commandBus: CommandBus,
		@Inject(BlogInjectionToken.QUERY_BLOG_REPOSITORY)
		private readonly queryBlogsRepository: QueryBlogsRepositoryInterface,
		@Inject(PostInjectionToken.QUERY_POST_REPOSITORY)
		private readonly queryPostsRepository: QueryPostsRepositoryInterface,
		@Inject(CommentInjectionToken.QUERY_COMMENT_REPOSITORY)
		private readonly queryCommentsRepository: QueryCommentsRepositoryInterface,
	) {}

	@Get()
	findAllBlogs(@Query() query: QueryBlogDto, @CurrentUserId() currentUserId) {
		return this.queryBlogsRepository.findAllBlogs(query, currentUserId);
	}

	@Get('comments')
	findAllCommentsOfPosts(@Query() query: QueryDto, @CurrentUserId() currentUserId) {
		return this.queryCommentsRepository.findAllCommentsOfBlogs(query, currentUserId);
	}

	@Post()
	async createBlog(
		@Body() data: CreateBlogDto,
		@CurrentUserId() currentUserId,
		@CurrentUserLogin() currentUserLogin,
	) {
		const blogId = await this.commandBus.execute(
			new CreateBlogCommand(data, currentUserId, currentUserLogin),
		);
		return this.queryBlogsRepository.findBlogById(blogId);
	}

	@Post(':id/posts')
	async createPostOfBlog(
		@Param('id', new ParseIntPipe({ errorHttpStatusCode: 404 })) id: string,
		@Body() data: CreatePostOfBlogDto,
		@CurrentUserId() currentUserId,
	) {
		const postId = await this.commandBus.execute(
			new CreatePostOfBlogCommand(data, id, currentUserId),
		);
		return this.queryPostsRepository.findPostById(postId, currentUserId);
	}

	@HttpCode(204)
	@Put(':id')
	async updateBlog(
		@Param('id', new ParseIntPipe({ errorHttpStatusCode: 404 })) id: string,
		@Body() data: UpdateBlogDto,
		@CurrentUserId() currentUserId,
	) {
		await this.commandBus.execute(new UpdateBlogCommand(id, data, currentUserId));
	}

	@HttpCode(204)
	@Delete(':id')
	async removeBlog(
		@Param('id', new ParseIntPipe({ errorHttpStatusCode: 404 })) id: string,
		@CurrentUserId() currentUserId,
	) {
		await this.commandBus.execute(new RemoveBlogCommand(id, currentUserId));
	}

	@HttpCode(204)
	@Put(':blogId/posts/:postId')
	async updatePost(
		@Param('postId', new ParseIntPipe({ errorHttpStatusCode: 404 })) postId: string,
		@Param('blogId', new ParseIntPipe({ errorHttpStatusCode: 404 })) blogId: string,
		@Body() data: UpdatePostOfBlogDto,
		@CurrentUserId() currentUserId,
	) {
		await this.commandBus.execute(new UpdatePostCommand(blogId, postId, data, currentUserId));
	}

	@HttpCode(204)
	@Delete(':blogId/posts/:postId')
	async removePost(
		@Param('postId', new ParseIntPipe({ errorHttpStatusCode: 404 })) postId: string,
		@Param('blogId', new ParseIntPipe({ errorHttpStatusCode: 404 })) blogId: string,
		@CurrentUserId() currentUserId,
	) {
		await this.commandBus.execute(new RemovePostCommand(blogId, postId, currentUserId));
	}
}
