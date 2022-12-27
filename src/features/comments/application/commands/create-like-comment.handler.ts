import { CommandBus, CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { CreateRequestLikeDto } from '../../dto';
import { CommentModel } from '../../domain/comment.schema';
import { ValidationService } from '../../../../shared/validation/application/validation.service';
import { CommentsRepositoryInterface } from '../../interfaces/comments.repository.interface';
import { CreateLikeCommand } from '../../../likes/application/command/create-like.handler';
import { CommentNotFoundException } from '../../../../common/exceptions';
import { ForbiddenException, Inject } from '@nestjs/common';
import { CommentInjectionToken } from '../../infrastructure/providers/comment.injection.token';
import { LikeTypeEnum } from '../../../../common/dto/like-type.enum';
import { UsersService } from '../../../users/application/users.service';
import { UserModel } from '../../../users/domain/user.schema';

export class CreateLikeCommentCommand implements ICommand {
	constructor(
		public commentId: string,
		public userId: string,
		public userLogin: string,
		public data: CreateRequestLikeDto,
	) {}
}

@CommandHandler(CreateLikeCommentCommand)
export class CreateLikeCommentHandler implements ICommandHandler<CreateLikeCommentCommand> {
	constructor(
		private readonly usersService: UsersService,
		@Inject(CommentInjectionToken.COMMENT_REPOSITORY)
		private readonly commentsRepository: CommentsRepositoryInterface,
		private readonly validationService: ValidationService,
		private readonly commandBus: CommandBus,
	) {}

	async execute(command: CreateLikeCommentCommand): Promise<void> {
		await this.validationService.validate(command.data, CreateRequestLikeDto);

		const comment: CommentModel = await this.commentsRepository.find(command.commentId);
		if (!comment) throw new CommentNotFoundException(command.commentId);

		const user: UserModel = await this.usersService.findUserByIdOrErrorThrow(command.userId);
		if (user.isBanned === true) throw new ForbiddenException();

		await this.commandBus.execute(
			new CreateLikeCommand(
				command.commentId,
				command.userId,
				command.userLogin,
				command.data,
				LikeTypeEnum.Comment,
			),
		);
	}
}
