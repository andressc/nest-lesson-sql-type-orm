import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { LikesInfo, LikeStatusEnum } from '../../../../common/dto';
import { Comment, CommentModel } from '../../domain/comment.schema';
import { QueryCommentsRepositoryInterface } from '../../interfaces/query.comments.repository.interface';
import { ObjectId } from 'mongodb';
import { LikeDbDto } from '../../../likes/dto/like-db.dto';

@Injectable()
export class QueryCommentsRepository implements QueryCommentsRepositoryInterface {
	constructor(
		@InjectModel(Comment.name)
		private readonly commentModel: Model<CommentModel>,
	) {}

	async find(id: string): Promise<CommentModel | null> {
		const comment = await this.commentModel.aggregate([
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

		return comment[0];
	}

	async findQuery(
		searchString: Record<string, unknown>,
		sortBy: any,
		sortDirection: string,
		skip: number,
		pageSize: number,
	): Promise<CommentModel[] | null> {
		return this.commentModel
			.aggregate([
				{ $match: { ...searchString, isBanned: false } },
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
		return this.commentModel.countDocuments({ ...searchString, isBanned: false });
	}

	public countLikes(comment: CommentModel, currentuserId: string | null): LikesInfo {
		const likesCount = comment.likes.filter(
			(v: LikeDbDto) => v.likeStatus === LikeStatusEnum.Like && !v.isBanned,
		).length;

		const dislikesCount = comment.likes.filter(
			(v: LikeDbDto) => v.likeStatus === LikeStatusEnum.Dislike && !v.isBanned,
		).length;

		let myStatus = LikeStatusEnum.None;

		comment.likes.forEach((it: LikeDbDto) => {
			if (currentuserId && new ObjectId(it.userId).equals(currentuserId)) myStatus = it.likeStatus;
		});

		return {
			likesCount,
			dislikesCount,
			myStatus,
		};
	}
}
