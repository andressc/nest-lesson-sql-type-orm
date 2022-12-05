import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BloggerBlogsController } from './api/blogger.blogs.controller';
import { BlogsService } from './application/blogs.service';
import { CreateBlogHandler } from './application/commands/create-blog.handler';
import { FindOneBlogHandler } from './application/queries/find-one-blog.handler';
import { UpdateBlogHandler } from './application/commands/update-blog.handler';
import { FindAllBlogHandler } from './application/queries/find-all-blog.handler';
import { RemoveBlogHandler } from './application/commands/remove-blog.handler';
import { CqrsModule } from '@nestjs/cqrs';
import { Blog, BlogSchema } from './domain/blog.schema';
import { IsUserCommentValidatorConstraint } from '../../common/decorators/Validation';
import { PaginationModule } from '../../shared/pagination/pagination.module';
import { AdminBlogsController } from './api/admin.blogs.controller';
import { BlogsController } from './api/blogs.controller';
import { FindAllBlogAdminHandler } from './application/queries/find-all-blog-admin.handler';
import { BindBlogWithUserHandler } from './application/commands/bind-blog-with-user.handler';
import { UsersModule } from '../users/users.module';
import { BanBlogHandler } from './application/commands/ban-blog.handler';
import { BanUnbanBlogOfUserHandler } from './application/commands/ban-unban-blog-of-user.handler';
import { Ban, BanSchema } from './domain/ban.schema';
import { BloggerUsersController } from '../users/api/blogger.users.controller';
import { FindAllBannedBlogOfUserHandler } from './application/queries/find-all-banned-blog-of-user.handler';
import { QueryBlogsRepositoryProvider } from './infrastructure/providers/query-blogs-repository.provider';
import { BlogsRepositoryProvider } from './infrastructure/providers/blogs-repository.provider';

export const CommandHandlers = [
	CreateBlogHandler,
	RemoveBlogHandler,
	UpdateBlogHandler,
	BindBlogWithUserHandler,
	BanBlogHandler,
	BanUnbanBlogOfUserHandler,
];
export const QueryHandlers = [
	FindOneBlogHandler,
	FindAllBlogHandler,
	FindAllBlogAdminHandler,
	FindAllBannedBlogOfUserHandler,
];
export const Repositories = [QueryBlogsRepositoryProvider, BlogsRepositoryProvider];
export const Services = [BlogsService, IsUserCommentValidatorConstraint];
export const Modules = [
	MongooseModule.forFeature([{ name: Blog.name, schema: BlogSchema }]),
	MongooseModule.forFeature([{ name: Ban.name, schema: BanSchema }]),
	CqrsModule,
	PaginationModule,
	UsersModule,
];

@Module({
	imports: Modules,
	controllers: [
		BloggerBlogsController,
		AdminBlogsController,
		BlogsController,
		BloggerUsersController,
	],
	providers: [...Services, ...Repositories, ...QueryHandlers, ...CommandHandlers],

	exports: [BlogsService, QueryBlogsRepositoryProvider, BlogsRepositoryProvider],
})
export class BlogsModule {}
