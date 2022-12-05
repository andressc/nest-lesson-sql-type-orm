import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogModel } from '../../domain/blog.schema';
import { QueryBlogsRepositoryInterface } from '../../interfaces/query.blogs.repository.interface';
import { Ban, BanModel } from '../../domain/ban.schema';
import { Sort } from '../../../../common/dto';
import { ObjectId } from 'mongodb';

@Injectable()
export class QueryBlogsRepository implements QueryBlogsRepositoryInterface {
	constructor(
		@InjectModel(Blog.name) private readonly blogModel: Model<BlogModel>,
		@InjectModel(Ban.name) private readonly banModel: Model<BanModel>,
	) {}

	async find(id: ObjectId): Promise<BlogModel | null> {
		return this.blogModel.findById(id);
	}

	async findQuery(
		searchString: Record<string, unknown>,
		sortBy: Sort,
		skip: number,
		pageSize: number,
	): Promise<BlogModel[] | null> {
		return this.blogModel.find(searchString).sort(sortBy).skip(skip).limit(pageSize);
	}

	async count(searchString): Promise<number> {
		return this.blogModel.countDocuments(searchString);
	}

	async findBanModel(
		searchString: Record<string, unknown>,
		sortBy: Sort,
		skip: number,
		pageSize: number,
	): Promise<BanModel[] | null> {
		return this.banModel.find(searchString).sort(sortBy).skip(skip).limit(pageSize);
	}

	async countBan(searchString): Promise<number> {
		return this.banModel.countDocuments(searchString);
	}
}
