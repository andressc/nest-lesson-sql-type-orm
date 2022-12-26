import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { CommentsRepositoryInterface } from '../../interfaces/comments.repository.interface';
import { Inject } from '@nestjs/common';
import { CommentInjectionToken } from '../../infrastructure/providers/comment.injection.token';

export class BanUnbanCommentCommand implements ICommand {
	constructor(public userId: string, public isBanned: boolean) {}
}

@CommandHandler(BanUnbanCommentCommand)
export class BanUnbanCommentHandler implements ICommandHandler<BanUnbanCommentCommand> {
	constructor(
		@Inject(CommentInjectionToken.COMMENT_REPOSITORY)
		private readonly commentsRepository: CommentsRepositoryInterface,
	) {}

	async execute(command: BanUnbanCommentCommand): Promise<void> {
		await this.commentsRepository.setBan(command.userId, command.isBanned);
	}
}
