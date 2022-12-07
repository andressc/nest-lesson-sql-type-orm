import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserModel } from '../../domain/user.schema';
import { QueryUsersRepositoryInterface } from '../../interfaces/query.users.repository.interface';
import { Sort } from '../../../../common/dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class QueryUsersRepository implements QueryUsersRepositoryInterface {
	constructor(
		@InjectDataSource() protected dataSource: DataSource,
		@InjectModel(User.name)
		private readonly userModel: Model<UserModel>,
	) {}

	async find(id: string): Promise<UserModel | null> {
		const user = await this.dataSource.query(`SELECT * FROM "Users" WHERE "id"=$1`, [id]);
		return user[0];
	}

	async findQuery(
		searchString: Record<string, unknown>,
		sortBy: Sort,
		skip: number,
		pageSize: number,
	): Promise<UserModel[] | null> {
		return this.dataSource.query(`SELECT * FROM "Users"`);
	}

	async count(searchString): Promise<number> {
		const count = await this.dataSource.query(`SELECT COUNT(id) FROM "Users"`);
		return +count[0].count;
	}

	public searchTerm(login: string | undefined, email: string | undefined): Record<string, unknown> {
		let searchString = {};

		const searchLoginTerm = login
			? {
					login: { $regex: login, $options: 'i' },
			  }
			: null;
		const searchEmailTerm = email
			? {
					email: { $regex: email, $options: 'i' },
			  }
			: null;

		if (searchLoginTerm) searchString = searchLoginTerm;
		if (searchEmailTerm) searchString = searchEmailTerm;

		if (searchLoginTerm && searchEmailTerm)
			searchString = {
				$or: [searchLoginTerm, searchEmailTerm],
			};

		return searchString;
	}
}
