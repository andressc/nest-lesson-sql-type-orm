import {
	Body,
	Controller,
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
import { ObjectIdDto } from '../../../common/dto';
import { AccessTokenGuard, GuestGuard } from '../../../common/guards';
import { QueryPostDto } from '../dto';
import { CreateCommentOfPostDto, CreateRequestLikeDto, QueryCommentDto } from '../../comments/dto';
import {
	CurrentUserId,
	CurrentuserIdNonAuthorized,
	CurrentUserLogin,
} from '../../../common/decorators/Param';
import { CommandBus } from '@nestjs/cqrs';
import { CreateCommentOfPostCommand } from '../../comments/application/commands/create-comment-of-post.handler';
import { CreateLikePostCommand } from '../application/commands/create-like-post.handler';
import { PostInjectionToken } from '../infrastructure/providers/post.injection.token';
import { QueryPostsRepositoryInterface } from '../interfaces/query.posts.repository.interface';
import { CommentInjectionToken } from '../../comments/infrastructure/providers/comment.injection.token';
import { QueryCommentsRepositoryInterface } from '../../comments/interfaces/query.comments.repository.interface';

@Controller('posts')
export class PostsController {
	constructor(
		private readonly commandBus: CommandBus,
		@Inject(PostInjectionToken.QUERY_POST_REPOSITORY)
		private readonly queryPostsRepository: QueryPostsRepositoryInterface,
		@Inject(CommentInjectionToken.QUERY_COMMENT_REPOSITORY)
		private readonly queryCommentsRepository: QueryCommentsRepositoryInterface,
	) {}

	@UseGuards(AccessTokenGuard)
	@Post(':id/comments')
	async createCommentOfPost(
		@Body() data: CreateCommentOfPostDto,
		@Param('id', new ParseIntPipe({ errorHttpStatusCode: 404 })) id: string,
		@CurrentUserId() currentUserId,
	) {
		const commentId = await this.commandBus.execute(
			new CreateCommentOfPostCommand(data, id, currentUserId),
		);
		return this.queryCommentsRepository.findCommentById(commentId, currentUserId);
	}

	@UseGuards(GuestGuard)
	@Get()
	findAllPosts(
		@Query() query: QueryPostDto,
		@CurrentuserIdNonAuthorized()
		currentUserId: ObjectIdDto | null,
	) {
		return this.queryPostsRepository.findAllPosts(query, currentUserId.id);
	}

	@UseGuards(GuestGuard)
	@Get(':id/comments')
	findAllCommentsOfPost(
		@Param('id', new ParseIntPipe({ errorHttpStatusCode: 404 })) id: string,
		@Query() query: QueryCommentDto,
		@CurrentuserIdNonAuthorized()
		currentUserId: ObjectIdDto | null,
	) {
		return this.queryCommentsRepository.findAllCommentsOfPost(query, id, currentUserId.id);
	}

	@Get(':id')
	@UseGuards(GuestGuard)
	findOnePost(
		@Param('id', new ParseIntPipe({ errorHttpStatusCode: 404 })) id: string,
		@CurrentuserIdNonAuthorized()
		currentUserId: ObjectIdDto | null,
	) {
		return this.queryPostsRepository.findPostById(id, currentUserId.id);
	}

	@HttpCode(204)
	@UseGuards(AccessTokenGuard)
	@Put(':id/like-status')
	async setLike(
		@Param('id', new ParseIntPipe({ errorHttpStatusCode: 404 })) id: string,
		@CurrentUserId() currentUserId,
		@CurrentUserLogin() currentUserLogin,
		@Body() data: CreateRequestLikeDto,
	) {
		await this.commandBus.execute(
			new CreateLikePostCommand(id, currentUserId, currentUserLogin, data),
		);
	}
}
