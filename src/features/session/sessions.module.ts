import { Module } from '@nestjs/common';
import { SessionsController } from './api/sessions.controller';
import { RemoveAllUserSessionHandler } from './application/commands/remove-all-user-session.handler';
import { RemoveUserSessionHandler } from './application/commands/remove-user-session.handler';
import { CqrsModule } from '@nestjs/cqrs';
import { QuerySessionsRepositoryProvider } from './infrastructure/providers/query-sessions-repository.provider';
import { SessionsRepositoryProvider } from './infrastructure/providers/sessions-repository.provider';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Session } from './domain/session.schema';

export const CommandHandlers = [RemoveAllUserSessionHandler, RemoveUserSessionHandler];
export const Repositories = [QuerySessionsRepositoryProvider, SessionsRepositoryProvider];
export const Services = [];

@Module({
	imports: [CqrsModule, TypeOrmModule.forFeature([Session])],

	controllers: [SessionsController],
	providers: [...Services, ...Repositories, ...CommandHandlers],
	exports: [SessionsRepositoryProvider],
})
export class SessionsModule {}
