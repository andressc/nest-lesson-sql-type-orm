import { LikeModel } from '../domain/like.schema';
import { CreateLikeExtendsDto } from '../dto/create-like-extends.dto';
import { BanRepositoryInterface } from '../../shared/interfaces/ban.repository.interface';
import { LikeStatusEnum } from '../../../common/dto';

/* eslint-disable */
export interface LikesRepositoryInterface
	extends BanRepositoryInterface<LikeModel, CreateLikeExtendsDto> {
	findLikeByItemIdAndUserId(postId: string, userId: string): Promise<LikeModel>;
	update(likeStatus: LikeStatusEnum, postId: string, userId: string): Promise<void>
}

/*export abstract class LikesRepositoryInterface {
	abstract createLikeModel(data: CreateLikeExtendsDto): Promise<LikeModel>;
	abstract findLikeModelByitemIdAnduserId(itemId: ObjectId, userId: ObjectId): Promise<LikeModel>;
	abstract setBan(userId: ObjectId, isBanned: boolean): Promise<void>;
	abstract save(likeModel: LikeModel): Promise<LikeModel>;
	abstract deleteAll(): Promise<void>;
}*/
