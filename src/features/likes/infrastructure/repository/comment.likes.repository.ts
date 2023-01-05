import { Injectable } from '@nestjs/common';
import { LikesRepositoryInterface } from '../../interfaces/likes.repository.interface';
import { LikeModel } from '../../domain/like.schema';
import { CreateLikeExtendsDto } from '../../dto/create-like-extends.dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { LikeStatusEnum } from '../../../../common/dto';

@Injectable()
export class CommentLikesRepository implements LikesRepositoryInterface {
	constructor(
		@InjectDataSource() protected dataSource: DataSource) {}

	async create(data: CreateLikeExtendsDto): Promise<LikeModel> {
		const like = await this.dataSource.query(
			`INSERT INTO "CommentLikes"
    ("commentId", "userId", "likeStatus", "addedAt", "isBanned")
		VALUES ($1, $2, $3, $4, $5) RETURNING *;`,
			[data.itemId, data.userId, data.likeStatus, data.addedAt, false],
		);

		return like[0];
	}

	async update(likeStatus: LikeStatusEnum, commentId: string, userId: string): Promise<void> {
		await this.dataSource.query(
			`UPDATE "CommentLikes" SET "likeStatus"=$1 WHERE "commentId"=$2 AND "userId"=$3`,
			[likeStatus, commentId, userId],
		);
	}

	async find(id: string): Promise<LikeModel | null> {
		const like = await this.dataSource.query(`SELECT * FROM "CommentLikes" WHERE "id"=$1`, [id]);

		if (like.length === 0) return null;
		return like[0];
	}

	async delete(model: LikeModel): Promise<void> {
		await this.dataSource.query(`DELETE FROM "CommentLikes" WHERE "id"=$1`, [model.id]);
	}

	async deleteAll(): Promise<void> {
		await this.dataSource.query(`DELETE FROM "CommentLikes"`);
	}

	async findLikeByItemIdAndUserId(commentId: string, userId: string): Promise<LikeModel> {
		const like = await this.dataSource.query(
			`SELECT * FROM "CommentLikes" WHERE "commentId"=$1 AND "userId"=$2`,
			[commentId, userId],
		);
		if (like.length === 0) return null;
		return like[0];
	}

	async setBan(userId: string, isBanned: boolean): Promise<void> {
		await this.dataSource.query(`UPDATE "CommentLikes" SET "isBanned"=$1 WHERE "userId"=$2`, [
			isBanned,
			userId,
		]);
	}
}
