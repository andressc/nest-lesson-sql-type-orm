import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CqrsModule } from '@nestjs/cqrs';
import { CreatePostHandler } from './application/commands/create-post.handler';
import { RemovePostHandler } from './application/commands/remove-post.handler';
import { UpdatePostHandler } from './application/commands/update-post.handler';
import { FindOnePostHandler } from './application/queries/find-one-post.handler';
import { FindAllPostHandler } from './application/queries/find-all-post.handler';
import { PostsService } from './application/posts.service';
import { Post, PostSchema } from './domain/post.schema';
import { BlogsModule } from '../blogs/blogs.module';
import { PostsController } from './api/posts.controller';
import { CreatePostOfBlogHandler } from './application/commands/create-post-of-blog.handler';
import { UsersModule } from '../users/users.module';
import { LikesModule } from '../likes/likes.module';
import { CreateLikePostHandler } from './application/commands/create-like-post.handler';
import { PaginationModule } from '../../shared/pagination/pagination.module';
import { BanUnbanPostHandler } from './application/commands/ban-unban-post.handler';
import { QueryPostsRepositoryProvider } from './infrastructure/providers/query-posts-repository.provider';
import { PostsRepositoryProvider } from './infrastructure/providers/posts-repository.provider';

export const CommandHandlers = [
	CreatePostHandler,
	RemovePostHandler,
	UpdatePostHandler,
	CreatePostOfBlogHandler,
	CreateLikePostHandler,
	BanUnbanPostHandler,
];
export const QueryHandlers = [FindOnePostHandler, FindAllPostHandler];
export const Repositories = [QueryPostsRepositoryProvider, PostsRepositoryProvider];
export const Services = [PostsService];
export const Modules = [
	MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
	CqrsModule,
	BlogsModule,
	UsersModule,
	LikesModule,
	PaginationModule,
];

@Module({
	imports: Modules,
	controllers: [PostsController],
	providers: [...Services, ...Repositories, ...QueryHandlers, ...CommandHandlers],

	exports: [PostsService, QueryPostsRepositoryProvider, PostsRepositoryProvider],
})
export class PostsModule {}
