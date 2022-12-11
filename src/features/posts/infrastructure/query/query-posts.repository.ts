import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { LikesInfoExtended, LikeStatusEnum } from '../../../../common/dto';
import { Post, PostModel } from '../../domain/post.schema';
import { QueryPostsRepositoryInterface } from '../../interfaces/query.posts.repository.interface';
import { ObjectId } from 'mongodb';
import { LikeDbDto } from '../../../likes/dto/like-db.dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class QueryPostsRepository implements QueryPostsRepositoryInterface {
	constructor(
		@InjectDataSource() protected dataSource: DataSource,
		@InjectModel(Post.name)
		private readonly postModel: Model<PostModel>,
	) {}

	async find(id: string): Promise<PostModel | null> {
		const post = await this.dataSource.query(
			`SELECT
				 p."id",
				 p."title",
				 p."shortDescription",
				 p."content",
				 p."blogId",
				 p."createdAt",
				 p."isBanned",
				 b."name",
				 l."userId",
				 l."likeStatus",
				 l."addedAt" AS "likeAddedAt",
				 u."login"
			 FROM "Posts" p
			     LEFT JOIN "PostLikes" l
			         ON p."id" = l."postId"
					 LEFT JOIN "Blogs" b
										 ON p."blogId" = b."id"
					 LEFT JOIN "Users" u
										 ON l."userId" = u."id"
			 WHERE p."id"=$1 AND p."isBanned"=$2 AND l."isBanned"=$2`,
			[id, false],
		);

		return {
			id: post[0].id,
			title: post[0].title,
			shortDescription: post[0].description,
			content: post[0].content,
			blogId: post[0].blogId,
			blogName: post[0].blogName,
			isBanned: post[0].isBanned,
			createdAt: post[0].createdAt,
			likes: this.likes(post),
		};
	}

	async findQuery(
		searchString: Record<string, unknown>,
		sortBy: any,
		sortDirection: string,
		skip: number,
		pageSize: number,
	): Promise<PostModel[] | null> {
		/*return await this.dataSource.query(
			`SELECT
				 p."title",
				 p."shortDescription",
				 p."content",
				 p."blogId",
				 p."createdAt",
				 l."likeStatus",
				 l."addedAt" AS "likeAddedAt" 
			 FROM "Posts" p
			     LEFT JOIN "PostLikes" l
			         ON p."id" = l."postId"
					 LEFT JOIN "Blogs" b
										 ON p."blogId" = b."id"
			 WHERE p."isBanned"=$1 AND l."isBanned"=$1`,
			[false],
		);*/

		const post = await this.dataSource.query(
			`SELECT
				 p."id",
				 p."title",
				 p."shortDescription",
				 p."content",
				 p."blogId",
				 p."createdAt",
				 p."isBanned",
				 b."name",
				 l."userId",
				 l."likeStatus",
				 l."addedAt" AS "likeAddedAt",
				 u."login"
			 FROM "Posts" p
			     LEFT JOIN "PostLikes" l
			         ON p."id" = l."postId"
					 LEFT JOIN "Blogs" b
					     ON p."blogId" = b."id"
					 LEFT JOIN "Users" u
					     ON l."userId" = u."id"
			 WHERE p."isBanned"=$1`,
			[false],
		);

		console.log(post);

		return post;
	}

	async count(searchString): Promise<number> {
		const count = await this.dataSource.query(
			`SELECT COUNT(id) FROM "Posts" WHERE "isBanned"=false`,
		);
		return +count[0].count;
	}

	public countLikes(post: PostModel, currentUserId: string | null): LikesInfoExtended {
		const likesCount = post.likes.filter(
			(v: LikeDbDto) => v.likeStatus === LikeStatusEnum.Like && !v.isBanned,
		).length;

		const dislikesCount = post.likes.filter(
			(v: LikeDbDto) => v.likeStatus === LikeStatusEnum.Dislike && !v.isBanned,
		).length;

		let myStatus = LikeStatusEnum.None;

		const newestLikes = [...post.likes]
			.filter((v: LikeDbDto) => v.likeStatus === LikeStatusEnum.Like && !v.isBanned)
			.sort((a: LikeDbDto, b: LikeDbDto) => (a.addedAt > b.addedAt ? -1 : 1))
			.slice(0, 3)
			.map((v: LikeDbDto) => ({
				addedAt: v.addedAt,
				userId: v.userId.toString(),
				login: v.login,
			}));

		post.likes.forEach((it: LikeDbDto) => {
			if (currentUserId && new ObjectId(it.userId).equals(currentUserId)) myStatus = it.likeStatus;
		});

		return {
			likesCount,
			dislikesCount,
			myStatus,
			newestLikes,
		};
	}

	private likes(posts) {
		return posts.map((v) => ({
			userId: v.userId,
			login: v.login,
			likeStatus: v.likeStatus,
			addedAt: v.likeAddedAt,
		}));
	}
}
