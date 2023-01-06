import { CreateCommentExtendsDto, UpdateCommentDto } from '../dto';
import { CommentModel } from '../domain/comment.schema';

export interface CommentsRepositoryInterface {
	setBan(userId: string, isBanned: boolean): Promise<void>;
	update(updateData: UpdateCommentDto, commentId: string): Promise<void>;
	create(data: CreateCommentExtendsDto): Promise<CommentModel>;
	find(id: string): Promise<CommentModel | null>;
	delete(model: CommentModel): Promise<void>;
	deleteAll(): Promise<void>;
}
