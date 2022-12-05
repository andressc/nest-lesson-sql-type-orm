import { Module } from '@nestjs/common';
import { SessionsController } from './api/sessions.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Session, SessionSchema } from './domain/session.schema';
import { FindAllSessionHandler } from './application/queries/find-all-session.handler';
import { RemoveAllUserSessionHandler } from './application/commands/remove-all-user-session.handler';
import { RemoveUserSessionHandler } from './application/commands/remove-user-session.handler';
import { CqrsModule } from '@nestjs/cqrs';
import { QuerySessionsRepositoryProvider } from './infrastructure/providers/query-sessions-repository.provider';
import { SessionsRepositoryProvider } from './infrastructure/providers/sessions-repository.provider';

export const CommandHandlers = [RemoveAllUserSessionHandler, RemoveUserSessionHandler];
export const QueryHandlers = [FindAllSessionHandler];
export const Repositories = [QuerySessionsRepositoryProvider, SessionsRepositoryProvider];
export const Services = [];

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: Session.name,
				schema: SessionSchema,
			},
		]),
		CqrsModule,
	],

	controllers: [SessionsController],
	providers: [...Services, ...Repositories, ...CommandHandlers, ...QueryHandlers],
	exports: [SessionsRepositoryProvider],
})
export class SessionsModule {}
