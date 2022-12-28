import { PostModel } from '../domain/post.schema';
import { MainQueryRepositoryInterface } from '../../shared/interfaces/main.query.repository.interface';

/* eslint-disable */
export interface QueryPostsRepositoryInterface
	extends MainQueryRepositoryInterface<PostModel> {
	searchTerm(blogId: string | undefined): string
}
