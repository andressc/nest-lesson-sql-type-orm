import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/domain/user.schema';
import { Post } from '../../posts/domain/post.schema';

@Entity()
export class PostLike {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => User, (u) => u.postLikes)
	userId: User;

	@ManyToOne(() => Post, (p) => p.likes)
	postId: Post;

	@Column()
	likeStatus: string;

	@Column()
	isBanned: boolean;

	@Column()
	addedAt: string;
}
