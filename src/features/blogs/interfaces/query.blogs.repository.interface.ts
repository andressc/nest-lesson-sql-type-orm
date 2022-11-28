import { BlogModel } from '../entity/blog.schema';
import { MainQueryRepositoryInterface } from '../../shared/interfaces/main.query.repository.interface';
import { BanModel } from '../entity/ban.schema';
import { Sort } from '../../../common/dto';

/* eslint-disable */
export interface QueryBlogsRepositoryInterface
	extends MainQueryRepositoryInterface<BlogModel> {
	findBanModel(
		searchString: Record<string, unknown>,
		sortBy: Sort,
		skip: number,
		pageSize: number,
	): Promise<BanModel[] | null>

	countBan(searchString): Promise<number>
}
