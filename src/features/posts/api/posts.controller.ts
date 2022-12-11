import {
	Body,
	Controller,
	Get,
	HttpCode,
	Param,
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
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateCommentOfPostCommand } from '../../comments/application/commands/create-comment-of-post.handler';
import { FindOnePostCommand } from '../application/queries/find-one-post.handler';
import { FindAllPostCommand } from '../application/queries/find-all-post.handler';
import { FindOneCommentCommand } from '../../comments/application/queries/find-one-comment.handler';
import { FindAllCommentOfPostCommand } from '../../comments/application/queries/find-all-comment-of-post.handler';
import { CreateLikePostCommand } from '../application/commands/create-like-post.handler';

@Controller('posts')
export class PostsController {
	constructor(private readonly commandBus: CommandBus, private readonly queryBus: QueryBus) {}

	@UseGuards(AccessTokenGuard)
	@Post(':id/comments')
	async createCommentOfPost(
		@Body() data: CreateCommentOfPostDto,
		@Param() param: ObjectIdDto,
		@CurrentUserId() currentUserId,
	) {
		const commentId = await this.commandBus.execute(
			new CreateCommentOfPostCommand(data, param.id, currentUserId),
		);
		return this.queryBus.execute(new FindOneCommentCommand(commentId, currentUserId));
	}

	@UseGuards(GuestGuard)
	@Get()
	findAllPosts(
		@Query() query: QueryPostDto,
		@CurrentuserIdNonAuthorized()
		currentUserId: ObjectIdDto | null,
	) {
		return this.queryBus.execute(new FindAllPostCommand(query, currentUserId.id));
	}

	@UseGuards(GuestGuard)
	@Get(':id/comments')
	findAllCommentsOfPost(
		@Param() param: ObjectIdDto,
		@Query() query: QueryCommentDto,
		@CurrentuserIdNonAuthorized()
		currentUserId: ObjectIdDto | null,
	) {
		return this.queryBus.execute(
			new FindAllCommentOfPostCommand(query, param.id, currentUserId.id),
		);
	}

	@Get(':id')
	@UseGuards(GuestGuard)
	findOnePost(
		@Param() param: ObjectIdDto,
		@CurrentuserIdNonAuthorized()
		currentUserId: ObjectIdDto | null,
	) {
		return this.queryBus.execute(new FindOnePostCommand(param.id, currentUserId.id));
	}

	@HttpCode(204)
	@UseGuards(AccessTokenGuard)
	@Put(':id/like-status')
	async setLike(
		@Param() param: ObjectIdDto,
		@CurrentUserId() currentUserId,
		@CurrentUserLogin() currentUserLogin,
		@Body() data: CreateRequestLikeDto,
	) {
		await this.commandBus.execute(
			new CreateLikePostCommand(param.id, currentUserId, currentUserLogin, data),
		);
	}
}
