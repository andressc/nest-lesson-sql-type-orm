import { Injectable } from '@nestjs/common';
import { PaginationCalc, QueryPaginationDto } from '../../../common/dto';

@Injectable()
export class PaginationService {
	pagination(query: QueryPaginationDto): PaginationCalc {
		const sortDirection = query.sortDirection === 'asc' ? 'ASC' : 'DESC';
		const sortBy = !query.sortBy ? `createdAt` : query.sortBy;

		if (!query.pageNumber || query.pageNumber === 0) {
			query.pageNumber = 1;
		}

		if (!query.pageSize || query.pageSize === 0) {
			query.pageSize = 10;
		}

		const skip = (query.pageNumber - 1) * query.pageSize;
		const pagesCount = Math.ceil(query.totalCount / query.pageSize);

		return {
			pagesCount,
			pageNumber: query.pageNumber,
			pageSize: query.pageSize,
			skip,
			sortBy,
			sortDirection,
		};
	}
}
