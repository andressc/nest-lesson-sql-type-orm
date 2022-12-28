import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { LikesDto } from '../../../common/dto';
import { UpdatePostOfBlogDto } from '../dto/update-post-of-blog.dto';

//export type PostModel = Post & Document;

export class PostModel {
	id: string;
	title: string;
	shortDescription: string;
	content: string;
	blogId: string;
	blogName: string;
	isBanned: boolean;
	createdAt: string;
	//likes: LikesDto[];
	likes: number;
	dislikes: number;
	status: string | null;
	like: Array<{
		userId: string;
		login: string;
		addedAt: string;
	}>;
}

@Schema()
export class Post {
	@Prop({ required: true })
	title: string;

	@Prop({ required: true })
	shortDescription: string;

	@Prop({ required: true })
	content: string;

	@Prop({ required: true })
	blogId: string;

	@Prop({ required: true })
	blogName: string;

	@Prop({ required: true })
	blogUserId: string;

	@Prop({ default: false })
	isBanned: boolean;

	@Prop({ required: true })
	createdAt: string;

	@Prop({ type: [] })
	likes: LikesDto[];

	updateData(data: UpdatePostOfBlogDto): void {
		this.title = data.title;
		this.shortDescription = data.shortDescription;
		this.content = data.content;
	}
}

export const PostSchema = SchemaFactory.createForClass(Post);

PostSchema.methods.updateData = Post.prototype.updateData;
