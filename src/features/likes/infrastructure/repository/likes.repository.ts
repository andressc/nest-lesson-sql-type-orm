import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { LikesRepositoryInterface } from '../../interfaces/likes.repository.interface';
import { Like, LikeModel } from '../../domain/like.schema';
import { CreateLikeExtendsDto } from '../../dto/create-like-extends.dto';
import { ObjectId } from 'mongodb';

@Injectable()
export class LikesRepository implements LikesRepositoryInterface {
	constructor(
		@InjectModel(Like.name)
		private readonly likeModel: Model<LikeModel>,
	) {}

	async create(data: CreateLikeExtendsDto): Promise<LikeModel> {
		return new this.likeModel(data);
	}

	async find(id: string): Promise<LikeModel | null> {
		return this.likeModel.findById(id);
	}

	async save(model: LikeModel): Promise<LikeModel> {
		return model.save();
	}

	async delete(model: LikeModel): Promise<void> {
		await model.delete();
	}

	async deleteAll(): Promise<void> {
		await this.likeModel.deleteMany();
	}

	async findLikeByitemIdAnduserId(itemId: ObjectId, userId: ObjectId): Promise<LikeModel> {
		return this.likeModel.findOne({ itemId, userId });
	}

	async setBan(userId: ObjectId, isBanned: boolean): Promise<void> {
		await this.likeModel.updateMany({ userId }, { isBanned });
	}
}
