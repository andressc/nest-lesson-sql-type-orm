import { Module } from '@nestjs/common';
import { UsersService } from './application/users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './api/users.controller';
import { CqrsModule } from '@nestjs/cqrs';
import { RemoveUserHandler } from './application/commands/remove-user.handler';
import { CreateUserHandler } from './application/commands/create-user.handler';
import { FindOneUserHandler } from './application/queries/find-one-user.handler';
import { FindMeUserHandler } from './application/queries/find-me-user.handler';
import { FindAllUserHandler } from './application/queries/find-all-user.handler';
import { User, UserSchema } from './domain/user.schema';
import { BanUnbanUserHandler } from './application/commands/ban-unban-user.handler';
import { SessionsModule } from '../session/sessions.module';
import { LikesModule } from '../likes/likes.module';
import { PaginationModule } from '../../shared/pagination/pagination.module';
import { QueryUsersRepositoryProvider } from './infrastructure/providers/query-users-repository.provider';
import { UsersRepositoryProvider } from './infrastructure/providers/users-repository.provider';

export const CommandHandlers = [RemoveUserHandler, CreateUserHandler, BanUnbanUserHandler];
export const QueryHandlers = [FindOneUserHandler, FindMeUserHandler, FindAllUserHandler];
export const Repositories = [QueryUsersRepositoryProvider, UsersRepositoryProvider];
export const Services = [UsersService];
export const Modules = [
	MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
	SessionsModule,
	CqrsModule,
	LikesModule,
	PaginationModule,
];

@Module({
	imports: Modules,

	controllers: [UsersController],
	providers: [...Services, ...Repositories, ...CommandHandlers, ...QueryHandlers],
	exports: [UsersService, UsersRepositoryProvider],
})
export class UsersModule {}
