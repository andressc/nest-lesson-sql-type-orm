import { Sort } from '../../../common/dto';

export interface MainQueryRepositoryInterface<MODEL> {
	find(id: string): Promise<MODEL | null>;
	findQuery(
		searchString: any,
		sortBy: Sort,
		sortDirection: string,
		skip: number,
		pageSize: number,
	): Promise<MODEL[] | null>;
	count(searchString): Promise<number>;
}
