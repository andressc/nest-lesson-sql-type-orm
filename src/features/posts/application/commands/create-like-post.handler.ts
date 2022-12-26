import { CommandBus, CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { PostsService } from '../posts.service';
import { ValidationService } from '../../../../shared/validation/application/validation.service';
import { CreateLikeCommand } from '../../../likes/application/command/create-like.handler';
import { CreateRequestLikeDto } from '../../../likes/dto/create-request-like.dto';
import { LikeTypeEnum } from '../../../../common/dto/like-type.enum';

export class CreateLikePostCommand implements ICommand {
	constructor(
		public postId: string,
		public userId: string,
		public userLogin: string,
		public data: CreateRequestLikeDto,
	) {}
}

@CommandHandler(CreateLikePostCommand)
export class CreateLikePostHandler implements ICommandHandler<CreateLikePostCommand> {
	constructor(
		private readonly postsService: PostsService,
		private readonly validationService: ValidationService,
		private readonly commandBus: CommandBus,
	) {}

	async execute(command: CreateLikePostCommand): Promise<void> {
		await this.validationService.validate(command.data, CreateRequestLikeDto);

		await this.postsService.findPostOrErrorThrow(command.postId);

		await this.commandBus.execute(
			new CreateLikeCommand(
				command.postId,
				command.userId,
				command.userLogin,
				command.data,
				LikeTypeEnum.Post,
			),
		);
	}
}
