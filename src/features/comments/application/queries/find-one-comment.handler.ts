import { CommentModel } from '../../domain/comment.schema';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CommentNotFoundException } from '../../../../common/exceptions';
import { ResponseCommentDto } from '../../dto';
import { QueryCommentsRepositoryInterface } from '../../interfaces/query.comments.repository.interface';
import { Inject } from '@nestjs/common';
import { CommentInjectionToken } from '../../infrastructure/providers/comment.injection.token';
import { LikeStatusEnum } from '../../../../common/dto';

export class FindOneCommentCommand {
	constructor(public id: string, public currentUserId: string | null) {}
}

@QueryHandler(FindOneCommentCommand)
export class FindOneCommentHandler implements IQueryHandler<FindOneCommentCommand> {
	constructor(
		@Inject(CommentInjectionToken.QUERY_COMMENT_REPOSITORY)
		private readonly queryCommentsRepository: QueryCommentsRepositoryInterface,
	) {}

	async execute(command: FindOneCommentCommand): Promise<ResponseCommentDto> {
		const comment: CommentModel | null = await this.queryCommentsRepository.find(
			command.id,
			command.currentUserId,
		);
		if (!comment) throw new CommentNotFoundException(command.id);

		//const likesInfo = this.queryCommentsRepository.countLikes(comment, command.currentUserId);

		return {
			id: comment.id.toString(),
			content: comment.content,
			userId: comment.userId.toString(),
			userLogin: comment.login,
			createdAt: comment.createdAt,
			likesInfo: {
				likesCount: +comment.likes,
				dislikesCount: +comment.dislikes,
				myStatus: comment.status ? LikeStatusEnum[comment.status] : LikeStatusEnum.None,
			},
		};
	}
}
