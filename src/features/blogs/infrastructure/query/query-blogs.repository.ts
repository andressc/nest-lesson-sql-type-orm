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
		return this.dataSource.query(`SELECT * FROM "Blogs"`);
	}

	async count(searchString): Promise<number> {
		const count = await this.dataSource.query(`SELECT COUNT(id) FROM "Blogs"`);
		return +count[0].count;
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
