import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/domain/user.schema';
import { Comment } from '../../comments/domain/comment.schema';

@Entity()
export class CommentLike {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => User, (u) => u.commentLikes)
	userId: User;

	@ManyToOne(() => Comment, (c) => c.likes)
	postId: Comment;

	@Column()
	likeStatus: string;

	@Column()
	isBanned: boolean;

	@Column()
	addedAt: string;
}
