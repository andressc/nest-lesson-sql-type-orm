import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogModel } from '../../domain/blog.schema';
import { CreateBlogExtendsDto } from '../../dto';
import { BlogsRepositoryInterface } from '../../interfaces/blogs.repository.interface';
import { Ban, BanModel } from '../../domain/ban.schema';
import { BanUnbanBlogOfUserExtendsDto } from '../../dto/ban-unban-blog-of-user-extends.dto';

@Injectable()
export class BlogsRepository implements BlogsRepositoryInterface {
	constructor(
		@InjectModel(Blog.name)
		private readonly blogModel: Model<BlogModel>,
		@InjectModel(Ban.name)
		private readonly banModel: Model<BanModel>,
	) {}

	async create(data: CreateBlogExtendsDto): Promise<BlogModel> {
		return new this.blogModel(data);
	}

	async find(id: string): Promise<BlogModel | null> {
		return this.blogModel.findById(id);
	}

	async save(model: BlogModel): Promise<BlogModel> {
		return model.save();
	}

	async delete(model: BlogModel): Promise<void> {
		await model.delete();
	}

	async deleteAll(): Promise<void> {
		await this.blogModel.deleteMany();
	}

	//Ban blog from user
	async findBanByBlogIdAndUserId(blogId: string, userId: string): Promise<BanModel | null> {
		return this.banModel.findOne({ blogId, userId });
	}

	async createBanModel(data: BanUnbanBlogOfUserExtendsDto): Promise<BanModel> {
		return new this.banModel(data);
	}

	async saveBanModel(model: BanModel): Promise<BanModel> {
		return model.save();
	}

	async deleteAllBan(): Promise<void> {
		await this.banModel.deleteMany();
	}
}
