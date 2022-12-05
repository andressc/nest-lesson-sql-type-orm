import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentModel } from '../../domain/comment.schema';
import { CreateCommentExtendsDto } from '../../dto';
import { CommentsRepositoryInterface } from '../../interfaces/comments.repository.interface';
import { ObjectId } from 'mongodb';

@Injectable()
export class CommentsRepository implements CommentsRepositoryInterface {
	constructor(
		@InjectModel(Comment.name)
		private readonly commentModel: Model<CommentModel>,
	) {}

	async create(data: CreateCommentExtendsDto): Promise<CommentModel> {
		return new this.commentModel(data);
	}

	async find(id: string): Promise<CommentModel | null> {
		return this.commentModel.findById(id);
	}

	async save(model: CommentModel): Promise<CommentModel> {
		return model.save();
	}

	async delete(model: CommentModel): Promise<void> {
		await model.delete();
	}

	async deleteAll(): Promise<void> {
		await this.commentModel.deleteMany();
	}

	async setBan(userId: ObjectId, isBanned: boolean): Promise<void> {
		await this.commentModel.updateMany({ userId }, { isBanned });
	}
}
