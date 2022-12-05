import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserModel } from '../../domain/user.schema';
import { QueryUsersRepositoryInterface } from '../../interfaces/query.users.repository.interface';
import { ObjectId } from 'mongodb';
import { Sort } from '../../../../common/dto';

@Injectable()
export class QueryUsersRepository implements QueryUsersRepositoryInterface {
	constructor(
		@InjectModel(User.name)
		private readonly userModel: Model<UserModel>,
	) {}

	async find(id: ObjectId): Promise<UserModel | null> {
		return this.userModel.findById(id);
	}

	async findQuery(
		searchString: Record<string, unknown>,
		sortBy: Sort,
		skip: number,
		pageSize: number,
	): Promise<UserModel[] | null> {
		return this.userModel.find(searchString).sort(sortBy).skip(skip).limit(pageSize);
	}

	async count(searchString): Promise<number> {
		return this.userModel.countDocuments(searchString);
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
