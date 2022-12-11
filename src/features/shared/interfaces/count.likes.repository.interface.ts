import { MainQueryRepositoryInterface } from './main.query.repository.interface';

export interface CountLikesRepositoryInterface<MODEL, TYPE>
	extends MainQueryRepositoryInterface<MODEL> {
	countLikes(model: MODEL, currentUserId: string | null): TYPE;
}
