import { LikeModel } from '../domain/like.schema';
import { CreateLikeExtendsDto } from '../dto/create-like-extends.dto';
import { LikeStatusEnum } from '../../../common/dto';

export interface LikesRepositoryInterface {
	setBan(userId: string, isBanned: boolean): Promise<void>;
	findLikeByItemIdAndUserId(postId: string, userId: string): Promise<LikeModel>;
	update(likeStatus: LikeStatusEnum, postId: string, userId: string): Promise<void>;
	create(data: CreateLikeExtendsDto): Promise<LikeModel>;
	find(id: string): Promise<LikeModel | null>;
	delete(model: LikeModel): Promise<void>;
	deleteAll(): Promise<void>;
}
