import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { CommentModel } from '../domain/comment.schema';
import { CommentNotFoundException } from '../../../common/exceptions';
import { CommentsRepositoryInterface } from '../interfaces/comments.repository.interface';
import { CommentInjectionToken } from '../infrastructure/providers/comment.injection.token';

@Injectable()
export class CommentsService {
	constructor(
		@Inject(CommentInjectionToken.COMMENT_REPOSITORY)
		private readonly commentsRepository: CommentsRepositoryInterface,
	) {}

	public async findCommentOrErrorThrow(id: string, authuserId?: string): Promise<CommentModel> {
		const comment: CommentModel | null = await this.commentsRepository.find(id);
		if (!comment) throw new CommentNotFoundException(id);
		if (authuserId && comment.userId !== authuserId) throw new ForbiddenException();
		return comment;
	}
}
