import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepositoryInterface } from '../../../blogs/interfaces/blogs.repository.interface';
import { CommentsRepositoryInterface } from '../../../comments/interfaces/comments.repository.interface';
import { PostsRepositoryInterface } from '../../../posts/interfaces/posts.repository.interface';
import { SessionsRepositoryInterface } from '../../../session/interfaces/sessions.repository.interface';
import { UsersRepositoryInterface } from '../../../users/interfaces/users.repository.interface';
import { LikesRepositoryInterface } from '../../../likes/interfaces/likes.repository.interface';
import { InjectThrottlerStorage } from '@nestjs/throttler';
import { ThrottlerStorageService } from '../../../../shared/throttler/application/throttler.storage.service';
import { Inject } from '@nestjs/common';
import { BlogInjectionToken } from '../../../blogs/infrastructure/providers/blog.injection.token';
import { PostInjectionToken } from '../../../posts/infrastructure/providers/post.injection.token';
import { CommentInjectionToken } from '../../../comments/infrastructure/providers/comment.injection.token';
import { LikeInjectionToken } from '../../../likes/infrastructure/providers/like.injection.token';
import { SessionInjectionToken } from '../../../session/infrastructure/providers/session.injection.token';
import { UserInjectionToken } from '../../../users/infrastructure/providers/user.injection.token';

export class RemoveAllTestingCommand implements ICommand {}

@CommandHandler(RemoveAllTestingCommand)
export class RemoveAllTestingHandler implements ICommandHandler<RemoveAllTestingCommand> {
	constructor(
		@Inject(BlogInjectionToken.BLOG_REPOSITORY)
		private readonly blogsRepository: BlogsRepositoryInterface,
		@Inject(PostInjectionToken.POST_REPOSITORY)
		private readonly postsRepository: PostsRepositoryInterface,
		@Inject(UserInjectionToken.USER_REPOSITORY)
		private readonly usersRepository: UsersRepositoryInterface,
		@Inject(CommentInjectionToken.COMMENT_REPOSITORY)
		private readonly commentsRepository: CommentsRepositoryInterface,
		@Inject(SessionInjectionToken.SESSION_REPOSITORY)
		private readonly sessionRepository: SessionsRepositoryInterface,
		@Inject(LikeInjectionToken.LIKE_REPOSITORY)
		private readonly likesRepository: LikesRepositoryInterface,
		@InjectThrottlerStorage() private storage: ThrottlerStorageService,
	) {}

	async execute(): Promise<void> {
		this.storage.clearStorage();
		await this.blogsRepository.deleteAll();
		await this.blogsRepository.deleteAllBan();
		await this.postsRepository.deleteAll();
		await this.usersRepository.deleteAll();
		await this.commentsRepository.deleteAll();
		await this.sessionRepository.deleteAll();
		await this.likesRepository.deleteAll();
	}
}
