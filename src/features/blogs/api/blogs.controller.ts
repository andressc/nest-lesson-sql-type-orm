import { Controller, Get, Inject, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { ObjectIdDto } from '../../../common/dto';
import { GuestGuard } from '../../../common/guards';
import { QueryBlogDto } from '../dto';
import { QueryPostDto } from '../../posts/dto';
import { CurrentuserIdNonAuthorized } from '../../../common/decorators/Param';
import { CommandBus } from '@nestjs/cqrs';
import { BlogInjectionToken } from '../infrastructure/providers/blog.injection.token';
import { QueryBlogsRepositoryInterface } from '../interfaces/query.blogs.repository.interface';
import { PostInjectionToken } from '../../posts/infrastructure/providers/post.injection.token';
import { QueryPostsRepositoryInterface } from '../../posts/interfaces/query.posts.repository.interface';

@Controller('blogs')
export class BlogsController {
	constructor(
		private readonly commandBus: CommandBus,
		@Inject(BlogInjectionToken.QUERY_BLOG_REPOSITORY)
		private readonly queryBlogsRepository: QueryBlogsRepositoryInterface,
		@Inject(PostInjectionToken.QUERY_POST_REPOSITORY)
		private readonly queryPostsRepository: QueryPostsRepositoryInterface,
	) {}

	@Get()
	findAllBlogs(@Query() query: QueryBlogDto) {
		return this.queryBlogsRepository.findAllBlogs(query);
	}

	@Get(':id/posts')
	@UseGuards(GuestGuard)
	findAllPostsOfBlog(
		@Query() query: QueryPostDto,
		@Param('id', new ParseIntPipe({ errorHttpStatusCode: 404 })) id: string,
		@CurrentuserIdNonAuthorized() currentUserId: ObjectIdDto | null,
	) {
		return this.queryPostsRepository.findAllPosts(query, currentUserId.id, id);
	}

	@Get(':id')
	findOneBlog(@Param('id', new ParseIntPipe({ errorHttpStatusCode: 404 })) id: string) {
		return this.queryBlogsRepository.findBlogById(id);
	}
}
