import { Injectable } from '@nestjs/common';
import { UserModel } from '../../domain/user.schema';
import { QueryUsersRepositoryInterface } from '../../interfaces/query.users.repository.interface';
import { Sort } from '../../../../common/dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class QueryUsersRepository implements QueryUsersRepositoryInterface {
	constructor(@InjectDataSource() protected dataSource: DataSource) {}

	async find(id: string): Promise<UserModel | null> {
		const user = await this.dataSource.query(`SELECT * FROM "Users" WHERE "id"=$1`, [id]);
		return user[0];
	}

	async findQuery(
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

	async count(searchString): Promise<number> {
		const count = await this.dataSource.query(`SELECT COUNT(id) FROM "Users" ${searchString}`);
		return +count[0].count;
	}

	public searchTerm(
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
