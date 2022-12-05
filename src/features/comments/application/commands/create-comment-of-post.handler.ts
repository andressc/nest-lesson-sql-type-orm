import { createDate } from '../../../../common/helpers';
import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { CreateCommentOfPostDto } from '../../dto';
import { UsersService } from '../../../users/application/users.service';
import { PostsService } from '../../../posts/application/posts.service';
import { UserModel } from '../../../users/domain/user.schema';
import { CommentModel } from '../../domain/comment.schema';
import { ValidationService } from '../../../../shared/validation/application/validation.service';
import { CommentsRepositoryInterface } from '../../interfaces/comments.repository.interface';
import { ForbiddenException, Inject } from '@nestjs/common';
import { CommentInjectionToken } from '../../infrastructure/providers/comment.injection.token';
import { BlogInjectionToken } from '../../../blogs/infrastructure/providers/blog.injection.token';
import { BlogsRepositoryInterface } from '../../../blogs/interfaces/blogs.repository.interface';
import { BanModel } from '../../../blogs/domain/ban.schema';
import { PostModel } from '../../../posts/domain/post.schema';

export class CreateCommentOfPostCommand implements ICommand {
	constructor(
		public data: CreateCommentOfPostDto,
		public postId: string,
		public authUserId: string,
	) {}
}

@CommandHandler(CreateCommentOfPostCommand)
export class CreateCommentOfPostHandler implements ICommandHandler<CreateCommentOfPostCommand> {
	constructor(
		private readonly usersService: UsersService,
		private readonly postsService: PostsService,
		@Inject(CommentInjectionToken.COMMENT_REPOSITORY)
		private readonly commentsRepository: CommentsRepositoryInterface,
		@Inject(BlogInjectionToken.BLOG_REPOSITORY)
		private readonly blogsRepository: BlogsRepositoryInterface,
		private readonly validationService: ValidationService,
	) {}

	async execute(command: CreateCommentOfPostCommand): Promise<string> {
		await this.validationService.validate(command.data, CreateCommentOfPostDto);

		const user: UserModel = await this.usersService.findUserByIdOrErrorThrow(command.authUserId);
		const post: PostModel = await this.postsService.findPostOrErrorThrow(command.postId);

		const banned: BanModel | null = await this.blogsRepository.findBanByBlogIdAndUserId(
			post.blogId,
			command.authUserId,
		);

		if (banned && banned.isBanned === true) throw new ForbiddenException();

		const newComment: CommentModel = await this.commentsRepository.create({
			...command.data,
			userId: command.authUserId,
			userLogin: user.login,
			postId: command.postId,
			blogId: post.blogId,
			blogName: post.blogName,
			postTitle: post.title,
			blogUserId: post.blogUserId,
			createdAt: createDate(),
		});

		const result = await this.commentsRepository.save(newComment);
		return result.id.toString();
	}
}
