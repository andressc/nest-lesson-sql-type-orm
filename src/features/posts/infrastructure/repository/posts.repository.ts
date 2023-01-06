import { Injectable } from '@nestjs/common';
import { PostModel } from '../../domain/post.schema';
import { CreatePostExtendsDto } from '../../dto';
import { PostsRepositoryInterface } from '../../interfaces/posts.repository.interface';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { UpdatePostOfBlogDto } from '../../dto/update-post-of-blog.dto';

@Injectable()
export class PostsRepository implements PostsRepositoryInterface {
	constructor(@InjectDataSource() protected dataSource: DataSource) {}

	async create(data: CreatePostExtendsDto): Promise<PostModel> {
		const post = await this.dataSource.query(
			`INSERT INTO "Posts"
    ("title", "shortDescription", "content", "blogId", "isBanned", "createdAt")
		VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;`,
			[data.title, data.shortDescription, data.content, data.blogId, false, data.createdAt],
		);

		return post[0];
	}

	async find(id: string): Promise<PostModel | null> {
		const post = await this.dataSource.query(`SELECT * FROM "Posts" WHERE "id"=$1`, [id]);
		return post[0];
	}

	async update(updateData: UpdatePostOfBlogDto, postId: string): Promise<void> {
		await this.dataSource.query(
			`UPDATE "Posts" SET "title"=$1, "shortDescription"=$2, "content"=$3 WHERE "id"=$4`,
			[updateData.title, updateData.shortDescription, updateData.content, postId],
		);
	}

	async delete(model: PostModel): Promise<void> {
		await this.dataSource.query(`DELETE FROM "Posts" WHERE "id"=$1`, [model.id]);
	}

	async deleteAll(): Promise<void> {
		await this.dataSource.query(`TRUNCATE "Posts" RESTART IDENTITY`);
	}

	async setBan(blogId: string, isBanned: boolean): Promise<void> {
		await this.dataSource.query(`UPDATE "Posts" SET "isBanned"=$1 WHERE "blogId"=$2`, [
			isBanned,
			blogId,
		]);
	}
}
