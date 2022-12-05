import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { PostsRepositoryInterface } from '../../interfaces/posts.repository.interface';
import { PostInjectionToken } from '../../infrastructure/providers/post.injection.token';

export class BanUnbanPostCommand implements ICommand {
	constructor(public blogId: string, public isBanned: boolean) {}
}

@CommandHandler(BanUnbanPostCommand)
export class BanUnbanPostHandler implements ICommandHandler<BanUnbanPostCommand> {
	constructor(
		@Inject(PostInjectionToken.POST_REPOSITORY)
		private readonly postsRepository: PostsRepositoryInterface,
	) {}

	async execute(command: BanUnbanPostCommand): Promise<void> {
		await this.postsRepository.setBan(command.blogId, command.isBanned);
	}
}
