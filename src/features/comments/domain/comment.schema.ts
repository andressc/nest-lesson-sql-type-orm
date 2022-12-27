import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { UpdateCommentDto } from '../dto';
import { LikesDto } from '../../../common/dto';

//export type CommentModel = Comment & Document;

export class CommentModel {
	id: string;
	content: string;
	userId: string;
	login: string;
	postId: string;
	//blogUserId: string;
	postTitle: string;
	blogId: string;
	blogName: string;
	createdAt: string;
	isBanned: boolean;
	//likes: LikesDto[];
	likes: number;
	dislikes: number;
	status: string | null;
}

@Schema()
export class Comment {
	@Prop({ required: true })
	content: string;

	@Prop({ required: true })
	userId: string;

	@Prop({ required: true })
	userLogin: string;

	@Prop({ required: true })
	postId: string;

	@Prop({ required: true })
	blogUserId: string;

	@Prop({ required: true })
	postTitle: string;

	@Prop({ required: true })
	blogId: string;

	@Prop({ required: true })
	blogName: string;

	@Prop({ required: true })
	createdAt: string;

	@Prop({ default: false })
	isBanned: boolean;

	@Prop({ type: [] })
	likes: LikesDto[];

	updateData(data: UpdateCommentDto): void {
		this.content = data.content;
	}
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

CommentSchema.methods.updateData = Comment.prototype.updateData;
