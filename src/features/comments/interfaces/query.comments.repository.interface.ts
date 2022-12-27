import { CommentModel } from '../domain/comment.schema';
import { MainQueryRepositoryInterface } from '../../shared/interfaces/main.query.repository.interface';

/* eslint-disable */
export interface QueryCommentsRepositoryInterface
	extends MainQueryRepositoryInterface<CommentModel> {
	searchTerm(postId: string | undefined): string
}
