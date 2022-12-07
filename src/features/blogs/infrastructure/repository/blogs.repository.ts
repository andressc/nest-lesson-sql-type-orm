import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogModel } from '../../domain/blog.schema';
import { CreateBlogExtendsDto, UpdateBlogDto } from '../../dto';
import { BlogsRepositoryInterface } from '../../interfaces/blogs.repository.interface';
import { Ban, BanModel } from '../../domain/ban.schema';
import { BanUnbanBlogOfUserExtendsDto } from '../../dto/ban-unban-blog-of-user-extends.dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class BlogsRepository implements BlogsRepositoryInterface {
	constructor(
		@InjectDataSource() protected dataSource: DataSource,
		@InjectModel(Blog.name)
		private readonly blogModel: Model<BlogModel>,
		@InjectModel(Ban.name)
		private readonly banModel: Model<BanModel>,
	) {}

	async create(data: CreateBlogExtendsDto): Promise<BlogModel> {
		const blog = await this.dataSource.query(
			`INSERT INTO "Blogs"
    ("name", "websiteUrl", "createdAt", description, "userId", "userLogin", "isBanned", "banDate")
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *;`,
			[
				data.name,
				data.websiteUrl,
				data.createdAt,
				data.description,
				data.userId,
				data.userLogin,
				false,
				null,
			],
		);

		return blog[0];
	}

	async find(id: string): Promise<BlogModel | null> {
		const blog = await this.dataSource.query(`SELECT * FROM "Blogs" WHERE "id"=$1`, [id]);
		return blog[0];
	}

	//????
	async save(model: BlogModel): Promise<BlogModel> {
		//return model.save();
		return model;
	}

	async bindBlogWithUser(userId: string, userLogin: string, blogId: string): Promise<void> {
		await this.dataSource.query(`UPDATE "Blogs" SET "userId"=$1, "userLogin"=$2 WHERE "id"=$3`, [
			userId,
			userLogin,
			blogId,
		]);
	}

	async banBlog(isBanned: boolean, banDate: string, blogId: string): Promise<void> {
		await this.dataSource.query(`UPDATE "Blogs" SET "isBanned"=$1, "banDate"=$2 WHERE "id"=$3`, [
			isBanned,
			banDate,
			blogId,
		]);
	}

	async update(updateData: UpdateBlogDto, blogId: string): Promise<void> {
		await this.dataSource.query(
			`UPDATE "Blogs" SET "name"=$1, "websiteUrl"=$2, "description"=$3 WHERE "id"=$4`,
			[updateData.name, updateData.websiteUrl, updateData.description, blogId],
		);
	}

	async delete(model: BlogModel): Promise<void> {
		await this.dataSource.query(`DELETE FROM "Blogs" WHERE "id"=$1`, [model.id]);
	}

	async deleteAll(): Promise<void> {
		await this.dataSource.query(`DELETE FROM "Blogs"`);
	}

	//Ban blog from user
	async findBanByblogIdAnduserId(blogId: string, userId: string): Promise<BanModel | null> {
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
