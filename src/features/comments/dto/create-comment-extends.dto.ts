import { CreateCommentDto } from './create-comment.dto';

export class CreateCommentExtendsDto extends CreateCommentDto {
	userId: string;
	userLogin: string;
	postId: string;
	blogId: string;
	blogName: string;
	postTitle: string;
	blogUserId: string;
	createdAt: string;
}
