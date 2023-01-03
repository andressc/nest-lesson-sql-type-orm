import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentModel } from '../../domain/comment.schema';
import { QueryCommentsRepositoryInterface } from '../../interfaces/query.comments.repository.interface';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class QueryCommentsRepository implements QueryCommentsRepositoryInterface {
	constructor(
		@InjectDataSource() protected dataSource: DataSource,
		@InjectModel(Comment.name)
		private readonly commentModel: Model<CommentModel>,
	) {}

	async find(id: string, currentUserId: string): Promise<CommentModel | null> {
		const comment = await this.dataSource.query(
			`SELECT
				 c."id",
				 c."content",
				 c."userId",
				 c."postId",
				 c."blogId",
				 c."createdAt",
				 c."isBanned",
				 b."name",
				 p."title",
				 l."userId" as likeUserId,
				 l."likeStatus",
				 l."addedAt" AS "likeAddedAt",
				 u."login",
				 (SELECT COUNT(l."id") FROM "CommentLikes" l WHERE c."id" = l."commentId" AND l."isBanned"=false AND l."likeStatus" = 'Like') AS likes,
				 (SELECT COUNT(l."id") FROM "CommentLikes" l WHERE c."id" = l."commentId" AND l."isBanned"=false AND l."likeStatus" = 'Dislike') AS dislikes,
				 (SELECT l."likeStatus" FROM "CommentLikes" l WHERE l."userId" = ${currentUserId} AND l."isBanned"=false AND l."commentId" = c."id") AS status
			 FROM "Comments" c
			     LEFT JOIN "CommentLikes" l
			         ON c."id" = l."commentId"
					 LEFT JOIN "Blogs" b
							 ON c."blogId" = b."id"
					 LEFT JOIN "Posts" p
							 ON c."postId" = p."id"
					 LEFT JOIN "Users" u
							 ON c."userId" = u."id"
			 WHERE c."id"=$1 AND c."isBanned"=$2`,
			[id, false],
		);

		if (comment.length === 0) return null;

		return {
			id: comment[0].id,
			content: comment[0].content,
			userId: comment[0].userId,
			login: comment[0].login,
			postId: comment[0].postId,
			title: comment[0].title,
			blogId: comment[0].blogId,
			name: comment[0].name,
			createdAt: comment[0].createdAt,
			isBanned: comment[0].isBanned,
			//likes: this.likes(comment),
			likes: comment[0].likes,
			dislikes: comment[0].dislikes,
			status: comment[0].status,
		};
	}

	async findQuery(
		searchString: Record<string, unknown>,
		sortBy: any,
		sortDirection: string,
		skip: number,
		pageSize: number,
		currentUserId: string | null,
	): Promise<CommentModel[] | null> {
		const order = `"${sortBy}" ${sortDirection}`;

		/*const resultQuery = await this.dataSource.query(
			`SELECT
				 c."id",
				 c."content",
				 c."userId",
				 c."postId",
				 c."blogId",
				 c."createdAt",
				 c."isBanned",
				 b."name",
				 p."title",
				 l."userId" as likeUserId,
				 l."likeStatus",
				 l."addedAt" AS "likeAddedAt",
				 u."login"
			 FROM "Comments" c
			     LEFT JOIN "CommentLikes" l
			         ON c."id" = l."commentId"
					 LEFT JOIN "Blogs" b
							 ON c."blogId" = b."id"
					 LEFT JOIN "Posts" p
							 ON c."postId" = p."id"
					 LEFT JOIN "Users" u
							 ON c."userId" = u."id"
			 WHERE c."isBanned"=$1 ${searchString} ORDER BY ${order} LIMIT $2 OFFSET $3`,
			[false, pageSize, skip],
		);*/

		/*const result = [];
		const addedComments = {};

		for (const commentRow of resultQuery) {
			let commentWithLikes = addedComments[commentRow.id];
			if (!commentWithLikes) {
				commentWithLikes = {
					id: commentRow.id,
					content: commentRow.content,
					userId: commentRow.userId,
					userLogin: commentRow.login,
					postId: commentRow.postId,
					postTitle: commentRow.title,
					blogId: commentRow.blogId,
					blogName: commentRow.name,
					createdAt: commentRow.createdAt,
					isBanned: commentRow.isBanned,
					likes: [],
				};
				result.push(commentWithLikes);
				addedComments[commentRow.id] = commentWithLikes;
			}

			commentWithLikes.likes.push({
				userId: commentRow.userId,
				likeStatus: commentRow.likeStatus,
				likeAddedAt: commentRow.likeAddedAt,
				login: commentRow.login,
			});
		}*/

		return await this.dataSource.query(
			`SELECT
				 c."id",
				 c."content",
				 c."userId",
				 c."postId",
				 c."blogId",
				 c."createdAt",
				 c."isBanned",
				 b."name",
				 p."title",
				 u."login",
				 (SELECT COUNT(l."id") FROM "CommentLikes" l WHERE c."id" = l."commentId" AND l."isBanned"=false AND l."likeStatus" = 'Like') AS likes,
				 (SELECT COUNT(l."id") FROM "CommentLikes" l WHERE c."id" = l."commentId" AND l."isBanned"=false AND l."likeStatus" = 'Dislike') AS dislikes,
				 (SELECT l."likeStatus" FROM "CommentLikes" l WHERE l."userId" = ${currentUserId} AND l."isBanned"=false AND l."commentId" = c."id") AS status 
			 FROM "Comments" c
			     LEFT JOIN "Blogs" b
							 ON c."blogId" = b."id"
					 LEFT JOIN "Posts" p
							 ON c."postId" = p."id"
					 LEFT JOIN "Users" u
							 ON c."userId" = u."id"
			 WHERE c."isBanned"=$1 ${searchString} ORDER BY ${order} LIMIT $2 OFFSET $3`,
			[false, pageSize, skip],
		);
	}

	async count(searchString): Promise<number> {
		const count = await this.dataSource.query(
			`SELECT COUNT(id) FROM "Comments" WHERE "isBanned"=false ${searchString}`,
		);
		return +count[0].count;
	}

	/*public countLikes(comment: CommentModel, currentUserId: string | null): LikesInfo {
		const likesCount = comment.likes.filter(
			(v: LikeDbDto) => v.likeStatus === LikeStatusEnum.Like && !v.isBanned,
		).length;

		const dislikesCount = comment.likes.filter(
			(v: LikeDbDto) => v.likeStatus === LikeStatusEnum.Dislike && !v.isBanned,
		).length;

		let myStatus = LikeStatusEnum.None;

		comment.likes.forEach((it: LikeDbDto) => {
			if (it.likeStatus && currentUserId && it.userId === currentUserId) myStatus = it.likeStatus;
		});

		return {
			likesCount,
			dislikesCount,
			myStatus,
		};
	}*/

	private likes(comments) {
		return comments.map((v) => ({
			userId: v.userId,
			login: v.login,
			likeStatus: v.likeStatus,
			addedAt: v.likeAddedAt,
		}));
	}

	public searchTerm(postId: string | undefined): string {
		let searchString = '';

		if (postId) searchString = `AND "postId" = ${postId}`;

		return searchString;
	}
}
