import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CreateUserExtendsDto } from '../../dto';
import { User, UserModel } from '../../domain/user.schema';
import { UsersRepositoryInterface } from '../../interfaces/users.repository.interface';

@Injectable()
export class UsersRepository implements UsersRepositoryInterface {
	constructor(
		@InjectModel(User.name)
		private readonly userModel: Model<UserModel>,
	) {}

	async create(data: CreateUserExtendsDto): Promise<UserModel> {
		return new this.userModel(data);
	}

	async find(id: string): Promise<UserModel | null> {
		return this.userModel.findById(id);
	}

	async save(model: UserModel): Promise<UserModel> {
		return model.save();
	}

	async delete(model: UserModel): Promise<void> {
		await model.delete();
	}

	async deleteAll(): Promise<void> {
		await this.userModel.deleteMany();
	}

	async findUserByLogin(login: string): Promise<UserModel | null> {
		return this.userModel.findOne({ login });
	}

	async findUserByEmail(email: string): Promise<UserModel | null> {
		return this.userModel.findOne({ email });
	}

	async findUserByEmailOrLogin(emailOrLogin: string): Promise<UserModel | null> {
		return this.userModel.findOne({ $or: [{ login: emailOrLogin }, { email: emailOrLogin }] });
	}

	async findUserByConfirmationCode(confirmationCode: string): Promise<UserModel | null> {
		return this.userModel.findOne({
			confirmationCode,
		});
	}
}
