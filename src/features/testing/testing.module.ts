import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { BlogsModule } from '../blogs/blogs.module';
import { RemoveAllTestingHandler } from './application/commands/remove-all-testing.handler';
import { TestingController } from './api/testing.controller';
import { PostsModule } from '../posts/posts.module';
import { UsersModule } from '../users/users.module';
import { CommentsModule } from '../comments/comments.module';
import { SessionsModule } from '../session/sessions.module';

export const CommandHandlers = [RemoveAllTestingHandler];
export const Modules = [
	BlogsModule,
	PostsModule,
	UsersModule,
	CommentsModule,
	SessionsModule,
	CqrsModule,
];

@Module({
	imports: Modules,
	controllers: [TestingController],
	providers: [...CommandHandlers],
})
export class TestingModule {}
