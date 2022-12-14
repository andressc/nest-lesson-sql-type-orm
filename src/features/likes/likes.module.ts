import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateLikeHandler } from './application/command/create-like.handler';
import { BanUnbanLikeHandler } from './application/command/ban-unban-like.handler';
import { PostLikesRepositoryProvider } from './infrastructure/providers/post-likes-repository.provider';
import { CommentLikesRepositoryProvider } from './infrastructure/providers/comment-likes-repository.provider';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentLike } from './domain/comment.like.schema';
import { PostLike } from './domain/post.like.schema';

export const CommandHandlers = [CreateLikeHandler, BanUnbanLikeHandler];
export const QueryHandlers = [];
export const Repositories = [PostLikesRepositoryProvider, CommentLikesRepositoryProvider];
export const Services = [];
export const Modules = [CqrsModule, TypeOrmModule.forFeature([CommentLike, PostLike])];

@Module({
	imports: Modules,
	providers: [...Services, ...Repositories, ...QueryHandlers, ...CommandHandlers],

	exports: [PostLikesRepositoryProvider, CommentLikesRepositoryProvider],
})
export class LikesModule {}
