import { Injectable } from '@nestjs/common';
import { UserModel } from '../../domain/user.schema';
import { QueryUsersRepositoryInterface } from '../../interfaces/query.users.repository.interface';
import { PaginationCalc, PaginationDto, Sort } from '../../../../common/dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { QueryUserDto, ResponseUserDto, ResponseUserMeDto } from '../../dto';
import { PaginationService } from '../../../../shared/pagination/application/pagination.service';
import { UserNotFoundException } from '../../../../common/exceptions';

@Injectable()
export class QueryUsersRepository implements QueryUsersRepositoryInterface {
	constructor(
		@InjectDataSource() protected dataSource: DataSource,
		private readonly paginationService: PaginationService,
	) {}

	async findAllUsers(query: QueryUserDto): Promise<PaginationDto<ResponseUserDto[]>> {
		const searchString = QueryUsersRepository.searchTerm(
			query.searchLoginTerm,
			query.searchEmailTerm,
			query.banStatus,
		);

		const totalCount: number = await this.count(searchString);
		const paginationData: PaginationCalc = this.paginationService.pagination({
			...query,
			totalCount,
		});

		const user: UserModel[] = await this.findQuery(
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
			items: user.map((v: UserModel) => ({
				id: v.id.toString(),
				login: v.login,
				email: v.email,
				createdAt: v.createdAt,
				banInfo: {
					isBanned: v.isBanned,
					banDate: v.banDate,
					banReason: v.banReason,
				},
			})),
		};
	}

	async findMe(id: string): Promise<ResponseUserMeDto> {
		const user: UserModel | null = await this.find(id);
		if (!user) throw new UserNotFoundException(id);

		return {
			email: user.email,
			login: user.login,
			userId: user.id.toString(),
		};
	}

	async findUserById(id: string): Promise<ResponseUserDto> {
		const user: UserModel | null = await this.find(id);
		if (!user) throw new UserNotFoundException(id);

		return {
			id: user.id.toString(),
			login: user.login,
			email: user.email,
			createdAt: user.createdAt,
			banInfo: {
				isBanned: user.isBanned,
				banDate: user.banDate,
				banReason: user.banReason,
			},
		};
	}

	private async find(id: string): Promise<UserModel | null> {
		const user = await this.dataSource.query(`SELECT * FROM "Users" WHERE "id"=$1`, [id]);
		return user[0];
	}

	private async findQuery(
		searchString: string,
		sortBy: Sort,
		sortDirection: string,
		skip: number,
		pageSize: number,
	): Promise<UserModel[] | null> {
		let order = `"${sortBy}" ${sortDirection}`;
		if (sortBy === 'login') order = `"login" ${sortDirection}`;
		if (sortBy === 'email') order = `"email" ${sortDirection}`;

		return this.dataSource.query(
			`SELECT * FROM "Users" ${searchString} ORDER BY ${order} LIMIT $1 OFFSET $2`,
			[pageSize, skip],
		);
	}

	private async count(searchString): Promise<number> {
		const count = await this.dataSource.query(`SELECT COUNT(id) FROM "Users" ${searchString}`);
		return +count[0].count;
	}

	private static searchTerm(
		login: string | undefined,
		email: string | undefined,
		banStatus: string | undefined,
	): string {
		let searchString;

		const searchLoginTerm = login ? `'%${login}%'` : null;
		const searchEmailTerm = email ? `'%${email}%'` : null;
		let searchBanStatus;

		if (searchLoginTerm) searchString = `WHERE LOWER("login") LIKE LOWER(${searchLoginTerm})`;
		if (searchEmailTerm) searchString = `WHERE LOWER("email") LIKE LOWER(${searchEmailTerm})`;

		if (searchLoginTerm && searchEmailTerm)
			searchString = `WHERE LOWER("login") LIKE LOWER(${searchLoginTerm}) OR LOWER("email") LIKE LOWER(${searchEmailTerm})`;

		if (banStatus === 'banned') searchBanStatus = `"isBanned"=true`;
		if (banStatus === 'notBanned') searchBanStatus = `"isBanned"=false`;
		if (banStatus === 'all') searchBanStatus = '';
		if (searchString && searchBanStatus) searchString += ` AND ${searchBanStatus}`;
		if (!searchString && searchBanStatus) searchString = ` WHERE ${searchBanStatus}`;
		return searchString;
	}
}
