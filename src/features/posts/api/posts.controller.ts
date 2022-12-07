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
	CurrentuserId,
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
		@CurrentuserId() currentuserId,
	) {
		const commentId = await this.commandBus.execute(
			new CreateCommentOfPostCommand(data, param.id, currentuserId),
		);
		return this.queryBus.execute(new FindOneCommentCommand(commentId, currentuserId));
	}

	@UseGuards(GuestGuard)
	@Get()
	findAllPosts(
		@Query() query: QueryPostDto,
		@CurrentuserIdNonAuthorized()
		currentuserId: ObjectIdDto | null,
	) {
		return this.queryBus.execute(new FindAllPostCommand(query, currentuserId.id));
	}

	@UseGuards(GuestGuard)
	@Get(':id/comments')
	findAllCommentsOfPost(
		@Param() param: ObjectIdDto,
		@Query() query: QueryCommentDto,
		@CurrentuserIdNonAuthorized()
		currentuserId: ObjectIdDto | null,
	) {
		return this.queryBus.execute(
			new FindAllCommentOfPostCommand(query, param.id, currentuserId.id),
		);
	}

	@Get(':id')
	@UseGuards(GuestGuard)
	findOnePost(
		@Param() param: ObjectIdDto,
		@CurrentuserIdNonAuthorized()
		currentuserId: ObjectIdDto | null,
	) {
		return this.queryBus.execute(new FindOnePostCommand(param.id, currentuserId.id));
	}

	@HttpCode(204)
	@UseGuards(AccessTokenGuard)
	@Put(':id/like-status')
	async setLike(
		@Param() param: ObjectIdDto,
		@CurrentuserId() currentuserId,
		@CurrentUserLogin() currentUserLogin,
		@Body() data: CreateRequestLikeDto,
	) {
		await this.commandBus.execute(
			new CreateLikePostCommand(param.id, currentuserId, currentUserLogin, data),
		);
	}

	/*@UseGuards(BasicAuthGuard)
	@Post()
	async createPost(
		@Body() data: CreatePostDto,
		@CurrentuserIdNonAuthorized()
		currentuserId: ObjectIdDto | null,
	) {
		const postId = await this.commandBus.execute(new CreatePostCommand(data));
		return this.queryBus.execute(new FindOnePostCommand(postId, currentuserId.id));
	}

	@HttpCode(204)
	@UseGuards(BasicAuthGuard)
	@Put(':id')
	async updatePost(@Param() param: ObjectIdDto, @Body() data: UpdatePostDto) {
		await this.commandBus.execute(new UpdatePostCommand(param.id, data));
	}

	@HttpCode(204)
	@UseGuards(BasicAuthGuard)
	@Delete(':id')
	async removePost(@Param() param: ObjectIdDto) {
		await this.commandBus.execute(new RemovePostCommand(param.id));
	}*/
}
