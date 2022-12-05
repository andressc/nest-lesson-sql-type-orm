import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { LikesRepositoryInterface } from '../../interfaces/likes.repository.interface';
import { ObjectId } from 'mongodb';
import { Inject } from '@nestjs/common';
import { LikeInjectionToken } from '../../infrastructure/providers/like.injection.token';

export class BanUnbanLikeCommand implements ICommand {
	constructor(public userId: string, public isBanned: boolean) {}
}

@CommandHandler(BanUnbanLikeCommand)
export class BanUnbanLikeHandler implements ICommandHandler<BanUnbanLikeCommand> {
	constructor(
		@Inject(LikeInjectionToken.LIKE_REPOSITORY)
		private readonly likesRepository: LikesRepositoryInterface,
	) {}

	async execute(command: BanUnbanLikeCommand): Promise<void> {
		await this.likesRepository.setBan(new ObjectId(command.userId), command.isBanned);
	}
}
