import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostModel } from '../../domain/post.schema';
import { CreatePostExtendsDto } from '../../dto';
import { PostsRepositoryInterface } from '../../interfaces/posts.repository.interface';

@Injectable()
export class PostsRepository implements PostsRepositoryInterface {
	constructor(
		@InjectModel(Post.name)
		private readonly postModel: Model<PostModel>,
	) {}

	async create(data: CreatePostExtendsDto): Promise<PostModel> {
		return new this.postModel(data);
	}

	async find(id: string): Promise<PostModel | null> {
		return this.postModel.findById(id);
	}

	async save(model: PostModel): Promise<PostModel> {
		return model.save();
	}

	async delete(model: PostModel): Promise<void> {
		await model.delete();
	}

	async deleteAll(): Promise<void> {
		await this.postModel.deleteMany();
	}

	async setBan(blogId: string, isBanned: boolean): Promise<void> {
		await this.postModel.updateMany({ blogId }, { isBanned });
	}
}
