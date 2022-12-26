import { createDate } from '../../../../common/helpers';
import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { LikeModel } from '../../domain/like.schema';
import { LikesRepositoryInterface } from '../../interfaces/likes.repository.interface';
import { CreateRequestLikeDto } from '../../../comments/dto';
import { ValidationService } from '../../../../shared/validation/application/validation.service';
import { Inject } from '@nestjs/common';
import { LikeInjectionToken } from '../../infrastructure/providers/like.injection.token';
import { LikeTypeEnum } from '../../../../common/dto/like-type.enum';

export class CreateLikeCommand implements ICommand {
	constructor(
		public itemId: string,
		public userId: string,
		public userLogin: string,
		public data: CreateRequestLikeDto,
		public type: LikeTypeEnum,
	) {}
}

@CommandHandler(CreateLikeCommand)
export class CreateLikeHandler implements ICommandHandler<CreateLikeCommand> {
	constructor(
		@Inject(LikeInjectionToken.LIKE_REPOSITORY)
		private readonly postLikesRepository: LikesRepositoryInterface,
		@Inject(LikeInjectionToken.COMMENT_LIKE_REPOSITORY)
		private readonly commentLikesRepository: LikesRepositoryInterface,
		private readonly validationService: ValidationService,
	) {}

	async execute(command: CreateLikeCommand): Promise<void> {
		const repo =
			command.type === LikeTypeEnum.Post ? this.postLikesRepository : this.commentLikesRepository;

		await this.validationService.validate(command.data, CreateRequestLikeDto);

		const like: LikeModel | null = await repo.findLikeByItemIdAndUserId(
			command.itemId,
			command.userId,
		);

		if (!like) {
			await repo.create({
				itemId: command.itemId,
				userId: command.userId,
				login: command.userLogin,
				likeStatus: command.data.likeStatus,
				isBanned: false,
				addedAt: createDate(),
			});
			return;
		}

		await repo.update(command.data.likeStatus, command.itemId, command.userId);
		return;
	}
}
