import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	Param,
	ParseIntPipe,
	Put,
	UseGuards,
} from '@nestjs/common';
import { CreateRequestLikeDto, UpdateCommentDto } from '../dto';
import { AccessTokenGuard, GuestGuard } from '../../../common/guards';
import {
	CurrentUserId,
	CurrentuserIdNonAuthorized,
	CurrentUserLogin,
} from '../../../common/decorators/Param';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { UpdateCommentCommand } from '../application/commands/update-comment.handler';
import { RemoveCommentCommand } from '../application/commands/remove-comment.handler';
import { FindOneCommentCommand } from '../application/queries/find-one-comment.handler';
import { CreateLikeCommentCommand } from '../application/commands/create-like-comment.handler';

@Controller('comments')
export class CommentsController {
	constructor(private readonly commandBus: CommandBus, private readonly queryBus: QueryBus) {}

	@Get(':id')
	@UseGuards(GuestGuard)
	findOneComment(
		@Param('id', new ParseIntPipe({ errorHttpStatusCode: 404 })) id: string,
		@CurrentuserIdNonAuthorized()
		currentUserId,
	) {
		return this.queryBus.execute(new FindOneCommentCommand(id, currentUserId.id));
	}

	@HttpCode(204)
	@UseGuards(AccessTokenGuard)
	@Put(':id')
	async updateComment(
		@Param('id', new ParseIntPipe({ errorHttpStatusCode: 404 })) id: string,
		@Body() data: UpdateCommentDto,
		@CurrentUserId() currentUserId,
	) {
		await this.commandBus.execute(new UpdateCommentCommand(id, data, currentUserId));
	}

	@HttpCode(204)
	@UseGuards(AccessTokenGuard)
	@Delete(':id')
	async removeComment(
		@Param('id', new ParseIntPipe({ errorHttpStatusCode: 404 })) id: string,
		@CurrentUserId() currentUserId,
	) {
		await this.commandBus.execute(new RemoveCommentCommand(id, currentUserId));
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
			new CreateLikeCommentCommand(id, currentUserId, currentUserLogin, data),
		);
	}
}
