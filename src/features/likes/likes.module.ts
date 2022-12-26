import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CqrsModule } from '@nestjs/cqrs';
import { Like, LikeSchema } from './domain/like.schema';
import { CreateLikeHandler } from './application/command/create-like.handler';
import { BanUnbanLikeHandler } from './application/command/ban-unban-like.handler';
import { PostLikesRepositoryProvider } from './infrastructure/providers/post-likes-repository.provider';
import { CommentLikesRepositoryProvider } from './infrastructure/providers/comment-likes-repository.provider';

export const CommandHandlers = [CreateLikeHandler, BanUnbanLikeHandler];
export const QueryHandlers = [];
export const Repositories = [PostLikesRepositoryProvider, CommentLikesRepositoryProvider];
export const Services = [];
export const Modules = [
	MongooseModule.forFeature([{ name: Like.name, schema: LikeSchema }]),
	CqrsModule,
];

@Module({
	imports: Modules,
	providers: [...Services, ...Repositories, ...QueryHandlers, ...CommandHandlers],

	exports: [PostLikesRepositoryProvider, CommentLikesRepositoryProvider],
})
export class LikesModule {}
