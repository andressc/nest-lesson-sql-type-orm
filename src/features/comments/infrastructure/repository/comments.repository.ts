import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentModel } from '../../domain/comment.schema';
import { CreateCommentExtendsDto, UpdateCommentDto } from '../../dto';
import { CommentsRepositoryInterface } from '../../interfaces/comments.repository.interface';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class CommentsRepository implements CommentsRepositoryInterface {
	constructor(
		@InjectDataSource() protected dataSource: DataSource,
		@InjectModel(Comment.name)
		private readonly commentModel: Model<CommentModel>,
	) {}

	async create(data: CreateCommentExtendsDto): Promise<CommentModel> {
		const comment = await this.dataSource.query(
			`INSERT INTO "Comments"
    ("content", "userId", "postId", "blogId", "createdAt", "isBanned")
		VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;`,
			[data.content, data.userId, data.postId, data.blogId, data.createdAt, false],
		);

		return comment[0];
	}

	async find(id: string): Promise<CommentModel | null> {
		const comment = await this.dataSource.query(`SELECT * FROM "Comments" WHERE "id"=$1`, [id]);
		return comment[0];
	}

	async update(data: UpdateCommentDto, commentId: string): Promise<void> {
		await this.dataSource.query(`UPDATE "Comments" SET "content"=$1 WHERE "id"=$2`, [
			data.content,
			commentId,
		]);
	}

	async save(model: CommentModel): Promise<CommentModel> {
		//return model.save();
		return model;
	}

	async delete(model: CommentModel): Promise<void> {
		await this.dataSource.query(`DELETE FROM "Comments" WHERE "id"=$1`, [model.id]);
	}

	async deleteAll(): Promise<void> {
		await this.dataSource.query(`DELETE FROM "Comments"`);
	}

	async setBan(userId: string, isBanned: boolean): Promise<void> {
		await this.dataSource.query(`UPDATE "Comments" SET "isBanned"=$1 WHERE "userId"=$2`, [
			isBanned,
			userId,
		]);
	}
}
