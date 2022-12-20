import { BlogModel } from '../domain/blog.schema';
import { MainQueryRepositoryInterface } from '../../shared/interfaces/main.query.repository.interface';
import { BanModel } from '../domain/ban.schema';
import { Sort } from '../../../common/dto';

/* eslint-disable */
export interface QueryBlogsRepositoryInterface
	extends MainQueryRepositoryInterface<BlogModel> {
	findBanModel(
		searchString: string,
		sortBy: Sort,
		sortDirection: string,
		skip: number,
		pageSize: number,
	): Promise<BanModel[] | null>

	countBan(searchString): Promise<number>
	searchTerm(name: string | undefined, isBanned: boolean, currentUserId?: string): string
	searchTermBan(login: string | undefined, blogId: string): string
}
