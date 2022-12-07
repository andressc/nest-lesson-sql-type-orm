import { Body, Controller, Delete, Get, HttpCode, Param, Put, UseGuards } from '@nestjs/common';
import { ObjectIdDto } from '../../../common/dto';
import { CreateRequestLikeDto, UpdateCommentDto } from '../dto';
import { AccessTokenGuard, GuestGuard } from '../../../common/guards';
import {
	CurrentuserId,
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
		@Param() param: ObjectIdDto,
		@CurrentuserIdNonAuthorized()
		currentuserId: ObjectIdDto | null,
	) {
		return this.queryBus.execute(new FindOneCommentCommand(param.id, currentuserId.id));
	}

	@HttpCode(204)
	@UseGuards(AccessTokenGuard)
	@Put(':id')
	async updateComment(
		@Param() param: ObjectIdDto,
		@Body() data: UpdateCommentDto,
		@CurrentuserId() currentuserId,
	) {
		await this.commandBus.execute(new UpdateCommentCommand(param.id, data, currentuserId));
	}

	@HttpCode(204)
	@UseGuards(AccessTokenGuard)
	@Delete(':id')
	async removeComment(@Param() param: ObjectIdDto, @CurrentuserId() currentuserId) {
		await this.commandBus.execute(new RemoveCommentCommand(param.id, currentuserId));
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
			new CreateLikeCommentCommand(param.id, currentuserId, currentUserLogin, data),
		);
	}
}
