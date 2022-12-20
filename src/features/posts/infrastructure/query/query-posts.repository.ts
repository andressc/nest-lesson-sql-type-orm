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
			 WHERE p."id"=$1 AND p."isBanned"=$2`,
			[id, false],
		);

		if (post.length === 0) return null;

		return {
			id: post[0].id,
			title: post[0].title,
			shortDescription: post[0].shortDescription,
			content: post[0].content,
			blogId: post[0].blogId,
			blogName: post[0].name,
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
		let order = `"${sortBy}" ${sortDirection}`;
		if (sortBy === 'title') order = `"title" ${sortDirection}`;
		if (sortBy === 'shortDescription') order = `"shortDescription" ${sortDirection}`;
		if (sortBy === 'content') order = `"content" ${sortDirection}`;
		if (sortBy === 'blogId') order = `"blogId" ${sortDirection}`;
		if (sortBy === 'blogName') order = `"blogName" ${sortDirection}`;

		const resultQuery = await this.dataSource.query(
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
			 WHERE p."isBanned"=$1 ${searchString} ORDER BY ${order} LIMIT $2 OFFSET $3`,
			[false, pageSize, skip],
		);

		const result = [];
		const addedPosts = {};

		for (const postRow of resultQuery) {
			let postWithLikes = addedPosts[postRow.id];
			if (!postWithLikes) {
				postWithLikes = {
					id: postRow.id,
					title: postRow.title,
					shortDescription: postRow.shortDescription,
					content: postRow.content,
					blogId: postRow.blogId,
					createdAt: postRow.createdAt,
					isBanned: postRow.isBanned,
					name: postRow.name,
					likes: [],
				};
				result.push(postWithLikes);
				addedPosts[postRow.id] = postWithLikes;
			}

			postWithLikes.likes.push({
				userId: postRow.userId,
				likeStatus: postRow.likeStatus,
				likeAddedAt: postRow.likeAddedAt,
				login: postRow.login,
			});
		}
		return result;
	}

	async count(searchString): Promise<number> {
		const count = await this.dataSource.query(
			`SELECT COUNT(id) FROM "Posts" WHERE "isBanned"=false ${searchString}`,
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

	public searchTerm(blogId: string | undefined): string {
		let searchString = '';

		if (blogId) searchString = `AND "blogId" = ${blogId}`;

		return searchString;
	}
}
