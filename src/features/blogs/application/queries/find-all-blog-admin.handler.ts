import { QueryBlogDto } from '../../dto';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PaginationCalc, PaginationDto } from '../../../../common/dto';
import { BlogModel } from '../../domain/blog.schema';
import { PaginationService } from '../../../../shared/pagination/application/pagination.service';
import { QueryBlogsRepositoryInterface } from '../../interfaces/query.blogs.repository.interface';
import { Inject } from '@nestjs/common';
import { BlogInjectionToken } from '../../infrastructure/providers/blog.injection.token';
import { ResponseBlogAdminDto } from '../../dto/response-blog-admin.dto';

export class FindAllBlogAdminCommand {
	constructor(public query: QueryBlogDto) {}
}

@QueryHandler(FindAllBlogAdminCommand)
export class FindAllBlogAdminHandler implements IQueryHandler<FindAllBlogAdminCommand> {
	constructor(
		@Inject(BlogInjectionToken.QUERY_BLOG_REPOSITORY)
		private readonly queryBlogsRepository: QueryBlogsRepositoryInterface,
		private readonly paginationService: PaginationService,
	) {}

	async execute(command: FindAllBlogAdminCommand): Promise<PaginationDto<ResponseBlogAdminDto[]>> {
		const searchString = this.queryBlogsRepository.searchTerm(command.query.searchNameTerm, false);

		const totalCount: number = await this.queryBlogsRepository.count(searchString);
		const paginationData: PaginationCalc = this.paginationService.pagination({
			...command.query,
			totalCount,
		});

		const blog: BlogModel[] = await this.queryBlogsRepository.findQuery(
			searchString,
			paginationData.sortBy,
			paginationData.sortDirection,
			paginationData.skip,
			paginationData.pageSize,
			null,
		);

		return {
			pagesCount: paginationData.pagesCount,
			page: paginationData.pageNumber,
			pageSize: paginationData.pageSize,
			totalCount: totalCount,
			items: blog.map((v: BlogModel) => ({
				id: v.id.toString(),
				name: v.name,
				description: v.description,
				websiteUrl: v.websiteUrl,
				createdAt: v.createdAt,
				blogOwnerInfo: {
					userId: v.userId.toString(),
					userLogin: v.userLogin,
				},
				banInfo: {
					isBanned: v.isBanned,
					banDate: v.banDate,
				},
			})),
		};
	}
}
