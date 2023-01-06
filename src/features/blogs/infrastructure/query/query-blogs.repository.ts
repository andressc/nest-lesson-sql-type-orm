import { ForbiddenException, Injectable } from '@nestjs/common';
import { BlogModel } from '../../domain/blog.schema';
import { QueryBlogsRepositoryInterface } from '../../interfaces/query.blogs.repository.interface';
import { BanModel } from '../../domain/ban.schema';
import { PaginationCalc, PaginationDto, Sort } from '../../../../common/dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { QueryBanDto } from '../../dto/query-ban.dto';
import { ResponseBannedBlogOfUserDto } from '../../dto/response-banned-blog-of-user.dto';
import { BlogsService } from '../../application/blogs.service';
import { PaginationService } from '../../../../shared/pagination/application/pagination.service';
import { QueryBlogDto, ResponseBlogDto } from '../../dto';
import { ResponseBlogAdminDto } from '../../dto/response-blog-admin.dto';
import { BlogNotFoundException } from '../../../../common/exceptions';

@Injectable()
export class QueryBlogsRepository implements QueryBlogsRepositoryInterface {
	constructor(
		@InjectDataSource() protected dataSource: DataSource,
		private readonly blogsService: BlogsService,
		private readonly paginationService: PaginationService,
	) {}

	async findAllBannedBlogOfUser(
		blogId: string,
		query: QueryBanDto,
		currentUserId: string,
	): Promise<PaginationDto<ResponseBannedBlogOfUserDto[]>> {
		const searchString = QueryBlogsRepository.searchTermBan(query.searchLoginTerm, blogId);

		const blog: BlogModel = await this.blogsService.findBlogOrErrorThrow(blogId);
		if (blog.userId !== currentUserId) throw new ForbiddenException();

		const totalCount: number = await this.countBan(searchString);
		const paginationData: PaginationCalc = this.paginationService.pagination({
			...query,
			totalCount,
		});

		const ban: BanModel[] = await this.findBanModel(
			searchString,
			paginationData.sortBy,
			paginationData.sortDirection,
			paginationData.skip,
			paginationData.pageSize,
		);

		return {
			pagesCount: paginationData.pagesCount,
			page: paginationData.pageNumber,
			pageSize: paginationData.pageSize,
			totalCount: totalCount,
			items: ban.map((v: BanModel) => ({
				id: v.userId.toString(),
				login: v.login,
				banInfo: {
					isBanned: v.isBanned,
					banDate: v.banDate,
					banReason: v.banReason,
				},
			})),
		};
	}

	async findAllBlogs(
		query: QueryBlogDto,
		currentUserId?: string,
	): Promise<PaginationDto<ResponseBlogDto[]>> {
		const searchString = QueryBlogsRepository.searchTerm(query.searchNameTerm, true, currentUserId);

		const totalCount: number = await this.count(searchString);
		const paginationData: PaginationCalc = this.paginationService.pagination({
			...query,
			totalCount,
		});

		const blog: BlogModel[] = await this.findQuery(
			searchString,
			paginationData.sortBy,
			paginationData.sortDirection,
			paginationData.skip,
			paginationData.pageSize,
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
			})),
		};
	}

	async findAllBlogsByAdmin(query: QueryBlogDto): Promise<PaginationDto<ResponseBlogAdminDto[]>> {
		const searchString = QueryBlogsRepository.searchTerm(query.searchNameTerm, false);

		const totalCount: number = await this.count(searchString);
		const paginationData: PaginationCalc = this.paginationService.pagination({
			...query,
			totalCount,
		});

		const blog: BlogModel[] = await this.findQuery(
			searchString,
			paginationData.sortBy,
			paginationData.sortDirection,
			paginationData.skip,
			paginationData.pageSize,
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

	async findBlogById(id: string): Promise<ResponseBlogDto> {
		const blog: BlogModel | null = await this.find(id);
		if (!blog) throw new BlogNotFoundException(id);
		if (blog.isBanned) throw new BlogNotFoundException(id);

		return {
			id: blog.id.toString(),
			name: blog.name,
			description: blog.description,
			websiteUrl: blog.websiteUrl,
			createdAt: blog.createdAt,
		};
	}

	private async find(id: string): Promise<BlogModel | null> {
		const blog = await this.dataSource.query(`SELECT * FROM "Blogs" WHERE "id"=$1`, [id]);
		return blog[0];
	}

	private async findQuery(
		searchString: any,
		sortBy: Sort,
		sortDirection: string,
		skip: number,
		pageSize: number,
	): Promise<BlogModel[] | null> {
		let order = `"${sortBy}" ${sortDirection}`;
		if (sortBy === 'name') order = `"name" ${sortDirection}`;

		return this.dataSource.query(
			`SELECT * FROM "Blogs" ${searchString} ORDER BY ${order} LIMIT $1 OFFSET $2`,
			[pageSize, skip],
		);
	}

	private async count(searchString): Promise<number> {
		const count = await this.dataSource.query(`SELECT COUNT(id) FROM "Blogs" ${searchString}`);
		return +count[0].count;
	}

	private async findBanModel(
		searchString: string,
		sortBy: Sort,
		sortDirection: string,
		skip: number,
		pageSize: number,
	): Promise<BanModel[] | null> {
		let order = `"${sortBy}" ${sortDirection}`;
		if (sortBy === 'login') order = `"login" ${sortDirection}`;

		return await this.dataSource.query(
			`SELECT
				 ban."userId",
				 ban."blogId",
				 ban."isBanned",
				 ban."banReason",
				 ban."banDate",
				 ban."createdAt",
				 b."name",
				 u."login" AS login,
				 u."id"
			FROM "Ban" ban
			    LEFT JOIN "Blogs" b
			        ON ban."blogId" = b."id"
			    LEFT JOIN "Users" u
			        ON u."id" = ban."userId" 
			 WHERE ban."isBanned"=$1 ${searchString} ORDER BY ${order} LIMIT $2 OFFSET $3`,
			[true, pageSize, skip],
		);
	}

	private async countBan(searchString): Promise<number> {
		const count = await this.dataSource.query(
			`SELECT
    		COUNT(ban."id")
			 FROM "Ban" ban
			    LEFT JOIN "Blogs" b
			        ON ban."blogId" = b."id"
			    LEFT JOIN "Users" u
			        ON u."id" = ban."userId" 
			 WHERE ban."isBanned"=$1 ${searchString}`,
			[true],
		);

		return +count[0].count;
	}

	private static searchTerm(
		name: string | undefined,
		isBanned: boolean,
		currentUserId?: string,
	): string {
		let searchString: string;
		let banned: string;
		if (isBanned) banned = `"isBanned" = false`;

		const searchNameTerm = name ? `'%${name}%'` : null;

		if (searchNameTerm) {
			searchString = `WHERE LOWER("name") LIKE LOWER(${searchNameTerm})${
				banned ? ' AND ' + banned : ''
			}`;
			if (currentUserId) searchString += ` AND "userId" = ${currentUserId}`;
		}

		if (!searchNameTerm && currentUserId)
			searchString = `WHERE "userId" = ${currentUserId}${banned ? ' AND ' + banned : ''}`;

		if (!searchNameTerm && banned) {
			searchString = `WHERE ${banned}`;
			if (currentUserId) searchString += ` AND "userId" = ${currentUserId}`;
		}

		return searchString;
	}

	private static searchTermBan(login: string | undefined, blogId: string): string {
		let searchString = ` AND "blogId"=${blogId}`;

		const searchLoginTerm = login ? `'%${login}%'` : null;

		if (searchLoginTerm) searchString += ` AND LOWER("login") LIKE LOWER(${searchLoginTerm})`;

		return searchString;
	}
}
