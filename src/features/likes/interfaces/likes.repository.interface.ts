import { LikeModel } from '../domain/like.schema';
import { CreateLikeExtendsDto } from '../dto/create-like-extends.dto';
import { ObjectId } from 'mongodb';
import { BanRepositoryInterface } from '../../shared/interfaces/ban.repository.interface';

/* eslint-disable */
export interface LikesRepositoryInterface
	extends BanRepositoryInterface<LikeModel, CreateLikeExtendsDto> {
	findLikeByitemIdAnduserId(itemId: ObjectId, userId: ObjectId): Promise<LikeModel>;
}

/*export abstract class LikesRepositoryInterface {
	abstract createLikeModel(data: CreateLikeExtendsDto): Promise<LikeModel>;
	abstract findLikeModelByitemIdAnduserId(itemId: ObjectId, userId: ObjectId): Promise<LikeModel>;
	abstract setBan(userId: ObjectId, isBanned: boolean): Promise<void>;
	abstract save(likeModel: LikeModel): Promise<LikeModel>;
	abstract deleteAll(): Promise<void>;
}*/
