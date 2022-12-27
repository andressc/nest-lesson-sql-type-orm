import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { LikesRepositoryInterface } from '../../interfaces/likes.repository.interface';
import { Inject } from '@nestjs/common';
import { LikeInjectionToken } from '../../infrastructure/providers/like.injection.token';
import { LikeTypeEnum } from '../../../../common/dto/like-type.enum';

export class BanUnbanLikeCommand implements ICommand {
	constructor(public userId: string, public isBanned: boolean, public type: LikeTypeEnum) {}
}

@CommandHandler(BanUnbanLikeCommand)
export class BanUnbanLikeHandler implements ICommandHandler<BanUnbanLikeCommand> {
	constructor(
		@Inject(LikeInjectionToken.LIKE_REPOSITORY)
		private readonly postLikesRepository: LikesRepositoryInterface,
		@Inject(LikeInjectionToken.COMMENT_LIKE_REPOSITORY)
		private readonly commentLikesRepository: LikesRepositoryInterface,
	) {}

	async execute(command: BanUnbanLikeCommand): Promise<void> {
		const repo =
			command.type === LikeTypeEnum.Post ? this.postLikesRepository : this.commentLikesRepository;

		await repo.setBan(command.userId, command.isBanned);
	}
}
