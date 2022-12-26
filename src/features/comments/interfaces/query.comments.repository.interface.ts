import { CommentModel } from '../domain/comment.schema';
import { CountLikesRepositoryInterface } from '../../shared/interfaces/count.likes.repository.interface';
import { LikesInfo } from '../../../common/dto';

/* eslint-disable */
export interface QueryCommentsRepositoryInterface
	extends CountLikesRepositoryInterface<CommentModel, LikesInfo> {
	searchTerm(postId: string | undefined): string
}
