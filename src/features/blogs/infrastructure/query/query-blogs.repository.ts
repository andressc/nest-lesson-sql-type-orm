import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogModel } from '../../domain/blog.schema';
import { QueryBlogsRepositoryInterface } from '../../interfaces/query.blogs.repository.interface';
import { Ban, BanModel } from '../../domain/ban.schema';
import { Sort } from '../../../../common/dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class QueryBlogsRepository implements QueryBlogsRepositoryInterface {
	constructor(
		@InjectDataSource() protected dataSource: DataSource,
		@InjectModel(Blog.name) private readonly blogModel: Model<BlogModel>,
		@InjectModel(Ban.name) private readonly banModel: Model<BanModel>,
	) {}

	async find(id: string): Promise<BlogModel | null> {
		const blog = await this.dataSource.query(`SELECT * FROM "Blogs" WHERE "id"=$1`, [id]);
		return blog[0];
	}

	async findQuery(
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

	async count(searchString): Promise<number> {
		const count = await this.dataSource.query(`SELECT COUNT(id) FROM "Blogs" ${searchString}`);
		return +count[0].count;
	}

	async findBanModel(
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

	async countBan(searchString): Promise<number> {
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

	public searchTerm(name: string | undefined, isBanned: boolean, currentUserId?: string): string {
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

	public searchTermBan(login: string | undefined, blogId: string): string {
		let searchString = ` AND "blogId"=${blogId}`;

		const searchLoginTerm = login ? `'%${login}%'` : null;

		if (searchLoginTerm) searchString += ` AND LOWER("login") LIKE LOWER(${searchLoginTerm})`;

		return searchString;
	}
}
