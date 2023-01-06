import { CqrsModule } from '@nestjs/cqrs';
import { Module } from '@nestjs/common';
import { CreateCommentOfPostHandler } from './comments/application/commands/create-comment-of-post.handler';
import { RemoveCommentHandler } from './comments/application/commands/remove-comment.handler';
import { UpdateCommentHandler } from './comments/application/commands/update-comment.handler';
import { CommentsController } from './comments/api/comments.controller';
import { CommentsService } from './comments/application/comments.service';
import { UsersModule } from './users/users.module';
import { LikesModule } from './likes/likes.module';
import { BanUnbanCommentHandler } from './comments/application/commands/ban-unban-comment.handler';
import { CreateLikeCommentHandler } from './comments/application/commands/create-like-comment.handler';
import { PaginationModule } from '../shared/pagination/pagination.module';
import { QueryCommentsRepositoryProvider } from './comments/infrastructure/providers/query-comments-repository.provider';
import { CommentsRepositoryProvider } from './comments/infrastructure/providers/comments-repository.provider';
import { CreatePostHandler } from './posts/application/commands/create-post.handler';
import { RemovePostHandler } from './posts/application/commands/remove-post.handler';
import { UpdatePostHandler } from './posts/application/commands/update-post.handler';
import { CreatePostOfBlogHandler } from './posts/application/commands/create-post-of-blog.handler';
import { CreateLikePostHandler } from './posts/application/commands/create-like-post.handler';
import { BanUnbanPostHandler } from './posts/application/commands/ban-unban-post.handler';
import { CreateBlogHandler } from './blogs/application/commands/create-blog.handler';
import { RemoveBlogHandler } from './blogs/application/commands/remove-blog.handler';
import { UpdateBlogHandler } from './blogs/application/commands/update-blog.handler';
import { BindBlogWithUserHandler } from './blogs/application/commands/bind-blog-with-user.handler';
import { BanBlogHandler } from './blogs/application/commands/ban-blog.handler';
import { BanUnbanBlogOfUserHandler } from './blogs/application/commands/ban-unban-blog-of-user.handler';
import { QueryPostsRepositoryProvider } from './posts/infrastructure/providers/query-posts-repository.provider';
import { PostsRepositoryProvider } from './posts/infrastructure/providers/posts-repository.provider';
import { QueryBlogsRepositoryProvider } from './blogs/infrastructure/providers/query-blogs-repository.provider';
import { BlogsRepositoryProvider } from './blogs/infrastructure/providers/blogs-repository.provider';
import { PostsService } from './posts/application/posts.service';
import { BlogsService } from './blogs/application/blogs.service';
import { IsUserCommentValidatorConstraint } from '../common/decorators/Validation';
import { PostsController } from './posts/api/posts.controller';
import { BloggerBlogsController } from './blogs/api/blogger.blogs.controller';
import { AdminBlogsController } from './blogs/api/admin.blogs.controller';
import { BlogsController } from './blogs/api/blogs.controller';
import { BloggerUsersController } from './users/api/blogger.users.controller';

export const CommandHandlers = [
	//Comments
	CreateCommentOfPostHandler,
	RemoveCommentHandler,
	UpdateCommentHandler,
	BanUnbanCommentHandler,
	CreateLikeCommentHandler,

	//Posts
	CreatePostHandler,
	RemovePostHandler,
	UpdatePostHandler,
	CreatePostOfBlogHandler,
	CreateLikePostHandler,
	BanUnbanPostHandler,

	//Blogs
	CreateBlogHandler,
	RemoveBlogHandler,
	UpdateBlogHandler,
	BindBlogWithUserHandler,
	BanBlogHandler,
	BanUnbanBlogOfUserHandler,
];
export const Repositories = [
	//Comments
	QueryCommentsRepositoryProvider,
	CommentsRepositoryProvider,

	//Posts
	QueryPostsRepositoryProvider,
	PostsRepositoryProvider,

	//Blogs
	QueryBlogsRepositoryProvider,
	BlogsRepositoryProvider,
];
export const Services = [
	CommentsService,
	PostsService,
	BlogsService,
	IsUserCommentValidatorConstraint,
];
export const Modules = [CqrsModule, UsersModule, LikesModule, PaginationModule];

@Module({
	imports: Modules,
	controllers: [
		CommentsController,
		PostsController,
		BloggerBlogsController,
		AdminBlogsController,
		BlogsController,
		BloggerUsersController,
	],
	providers: [...Services, ...Repositories, ...CommandHandlers],

	exports: [
		QueryCommentsRepositoryProvider,
		CommentsRepositoryProvider,
		PostsService,
		QueryPostsRepositoryProvider,
		PostsRepositoryProvider,
		BlogsService,
		QueryBlogsRepositoryProvider,
		BlogsRepositoryProvider,
	],
})
export class BlogsPostsCommentsModule {}
