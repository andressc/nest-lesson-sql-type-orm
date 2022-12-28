import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostModel } from '../../domain/post.schema';
import { QueryPostsRepositoryInterface } from '../../interfaces/query.posts.repository.interface';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class QueryPostsRepository implements QueryPostsRepositoryInterface {
	constructor(
		@InjectDataSource() protected dataSource: DataSource,
		@InjectModel(Post.name)
		private readonly postModel: Model<PostModel>,
	) {}

	async find(id: string, currentUserId: string): Promise<PostModel | null> {
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
				 b."userId",
				 u."login",
				 (SELECT COUNT(l."id") FROM "PostLikes" l WHERE p."id" = l."postId" AND l."isBanned"=false AND l."likeStatus" = 'Like') AS likes,
				 (SELECT COUNT(l."id") FROM "PostLikes" l WHERE p."id" = l."postId" AND l."isBanned"=false AND l."likeStatus" = 'Dislike') AS dislikes,
				 (SELECT l."likeStatus" FROM "PostLikes" l WHERE l."userId" = ${currentUserId} AND l."isBanned"=false AND l."postId" = p."id") AS status,
				 (SELECT array_agg(l."userId" || ' ' || l."addedAt" || ' ' || u."login" ORDER BY l."addedAt" DESC) 
				  FROM "PostLikes" l, "Users" u 
				  WHERE l."likeStatus" = 'Like' AND l."isBanned"=false AND l."postId" = p."id" AND l."userId"=u."id") AS newlike
			 FROM "Posts" p
					 LEFT JOIN "Blogs" b
							 ON p."blogId" = b."id"
					 LEFT JOIN "Users" u
							 ON b."userId" = u."id"
			 WHERE p."id"=$1 AND p."isBanned"=$2 AND u."isBanned"=false`,
			[id, false],
		);

		if (post.length === 0) return null;

		const newestLikes = [];

		for (let i = 0; i < 3; i++) {
			if (post[0].newlike && post[0].newlike[i]) {
				const splitUser = post[0].newlike[i].split(' ');
				newestLikes.push({
					userId: splitUser[0].toString(),
					login: splitUser[2],
					addedAt: splitUser[1],
				});
			}
		}

		return {
			id: post[0].id,
			title: post[0].title,
			shortDescription: post[0].shortDescription,
			content: post[0].content,
			blogId: post[0].blogId,
			blogName: post[0].name,
			isBanned: post[0].isBanned,
			createdAt: post[0].createdAt,
			//likes: this.likes(post),
			likes: post[0].likes,
			dislikes: post[0].dislikes,
			status: post[0].status,
			like: newestLikes,
		};
	}

	async findQuery(
		searchString: Record<string, unknown>,
		sortBy: any,
		sortDirection: string,
		skip: number,
		pageSize: number,
		currentUserId: string,
	): Promise<PostModel[] | null> {
		let order = `"${sortBy}" ${sortDirection}`;
		if (sortBy === 'title') order = `"title" ${sortDirection}`;
		if (sortBy === 'shortDescription') order = `"shortDescription" ${sortDirection}`;
		if (sortBy === 'content') order = `"content" ${sortDirection}`;
		if (sortBy === 'blogId') order = `"blogId" ${sortDirection}`;
		if (sortBy === 'blogName') order = `"blogName" ${sortDirection}`;

		const result = await this.dataSource.query(
			`SELECT 
    		 p."id",
				 p."title",
				 p."shortDescription",
				 p."content",
				 p."blogId",
				 p."createdAt",
				 p."isBanned",
				 b."name",
				 b."userId",
				 u."login",
				 (SELECT COUNT(l."id") FROM "PostLikes" l WHERE p."id" = l."postId" AND l."isBanned"=false AND l."likeStatus" = 'Like') AS likes,
				 (SELECT COUNT(l."id") FROM "PostLikes" l WHERE p."id" = l."postId" AND l."isBanned"=false AND l."likeStatus" = 'Dislike') AS dislikes,
				 (SELECT l."likeStatus" FROM "PostLikes" l WHERE l."userId" = ${currentUserId} AND l."isBanned"=false AND l."postId" = p."id") AS status,
				 (SELECT array_agg(l."userId" || ' ' || l."addedAt" || ' ' || u."login" ORDER BY l."addedAt" DESC) 
				  FROM "PostLikes" l, "Users" u 
				  WHERE l."likeStatus" = 'Like' AND l."isBanned"=false AND l."postId" = p."id" AND l."userId"=u."id") AS newlike
			 FROM "Posts" p
					 LEFT JOIN "Blogs" b
					     ON p."blogId" = b."id"
					 LEFT JOIN "Users" u
					     ON b."userId" = u."id"
			 WHERE p."isBanned"=$1 AND u."isBanned"=false ${searchString} ORDER BY ${order} LIMIT $2 OFFSET $3`,
			[false, pageSize, skip],
		);

		//console.log(result);

		const posts = [];

		for (const postRow of result) {
			const newestLikes = [];

			for (let i = 0; i < 3; i++) {
				if (postRow.newlike && postRow.newlike[i]) {
					const splitUser = postRow.newlike[i].split(' ');
					newestLikes.push({
						userId: splitUser[0].toString(),
						login: splitUser[2],
						addedAt: splitUser[1],
					});
				}
			}

			posts.push({
				id: postRow.id,
				title: postRow.title,
				shortDescription: postRow.shortDescription,
				content: postRow.content,
				blogId: postRow.blogId,
				blogName: postRow.name,
				createdAt: postRow.createdAt,
				isBanned: postRow.isBanned,
				likes: postRow.likes,
				dislikes: postRow.dislikes,
				status: postRow.status,
				like: newestLikes,
			});
		}

		return posts;

		/*const result = [];
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
					blogName: postRow.name,
					createdAt: postRow.createdAt,
					isBanned: postRow.isBanned,
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

		return result;*/
	}

	async count(searchString): Promise<number> {
		const count = await this.dataSource.query(
			`SELECT COUNT(id) FROM "Posts" WHERE "isBanned"=false ${searchString}`,
		);
		return +count[0].count;
	}

	/*public countLikes(post: PostModel, currentUserId: string | null): LikesInfoExtended {
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
			if (currentUserId && it.userId === currentUserId) myStatus = it.likeStatus;
		});

		return {
			likesCount,
			dislikesCount,
			myStatus,
			newestLikes,
		};
	}*/

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
