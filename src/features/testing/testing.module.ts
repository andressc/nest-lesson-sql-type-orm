import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { RemoveAllTestingHandler } from './application/commands/remove-all-testing.handler';
import { TestingController } from './api/testing.controller';
import { UsersModule } from '../users/users.module';
import { SessionsModule } from '../session/sessions.module';
import { LikesModule } from '../likes/likes.module';
import { BlogsPostsCommentsModule } from '../blogs.posts.comments.module';

export const CommandHandlers = [RemoveAllTestingHandler];
export const Modules = [
	UsersModule,
	BlogsPostsCommentsModule,
	SessionsModule,
	LikesModule,
	CqrsModule,
];

@Module({
	imports: Modules,
	controllers: [TestingController],
	providers: [...CommandHandlers],
})
export class TestingModule {}
