import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { LikeStatusEnum } from '../../../common/dto';
import { ObjectId } from 'mongodb';

export class LikeModel {
	id: string;
	itemId: string;
	userId: string;
	login: string;
	likeStatus: string;
	isBanned: boolean;
	addedAt: string;
}

@Schema()
export class Like {
	@Prop({ required: true })
	itemId: ObjectId;

	@Prop({ required: true })
	userId: ObjectId;

	@Prop({ required: true })
	login: string;

	@Prop({ required: true })
	likeStatus: string;

	@Prop({ default: false })
	isBanned: boolean;

	@Prop({ required: true })
	addedAt: string;

	updateLikeStatus(likeStatus: LikeStatusEnum) {
		this.likeStatus = likeStatus;
	}
}

export const LikeSchema = SchemaFactory.createForClass(Like);

LikeSchema.methods.updateLikeStatus = Like.prototype.updateLikeStatus;
