import { QueryDto } from './query.dto';
import { Expression, SortOrder } from 'mongoose';

export type Sort =
	| string
	| {
			[key: string]: SortOrder | { $meta: 'textScore' };
	  }
	| [string, SortOrder][];

export type SortAggregate =
	| string
	| Record<string, 1 | -1 | Expression.Meta>
	| Record<string, SortOrder>;

export class PaginationDto<T> {
	pagesCount: number;
	page: number;
	pageSize: number;
	totalCount: number;
	items: T;
}

export class PaginationCalc {
	pagesCount: number;
	pageNumber: number;
	pageSize: number;
	skip: number;
	sortBy: Sort;
	sortDirection: string;
}

export class QueryPaginationDto extends QueryDto {
	totalCount: number;
}
