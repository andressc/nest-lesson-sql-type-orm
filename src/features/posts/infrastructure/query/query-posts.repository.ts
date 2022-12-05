import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { LikesInfoExtended, LikeStatusEnum } from '../../../../common/dto';
import { Post, PostModel } from '../../domain/post.schema';
import { QueryPostsRepositoryInterface } from '../../interfaces/query.posts.repository.interface';
import { ObjectId } from 'mongodb';
import { LikeDbDto } from '../../../likes/dto/like-db.dto';

@Injectable()
export class QueryPostsRepository implements QueryPostsRepositoryInterface {
	constructor(
		@InjectModel(Post.name)
		private readonly postModel: Model<PostModel>,
	) {}

	async find(id: ObjectId): Promise<PostModel | null> {
		const post: PostModel[] = await this.postModel.aggregate([
			{ $match: { _id: id, isBanned: false } },
			{
				$graphLookup: {
					from: 'likes',
					startWith: '$_id',
					connectFromField: '_id',
					connectToField: 'itemId',
					as: 'likes',
				},
			},
		]);

		return post[0];
	}

	async findQuery(
		searchString: Record<string, unknown>,
		sortBy: any,
		skip: number,
		pageSize: number,
	): Promise<PostModel[] | null> {
		return this.postModel
			.aggregate([
				{ $match: searchString },
				{
					$graphLookup: {
						from: 'likes',
						startWith: '$_id',
						connectFromField: '_id',
						connectToField: 'itemId',
						as: 'likes',
					},
				},
			])
			.sort(sortBy)
			.skip(skip)
			.limit(pageSize);
	}

	async count(searchString): Promise<number> {
		return this.postModel.countDocuments({ ...searchString, isBanned: false });
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
}
