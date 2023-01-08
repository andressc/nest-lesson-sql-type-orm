import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Blog } from '../../blogs/domain/blog.schema';
import { Comment } from '../../comments/domain/comment.schema';
import { Session } from '../../session/domain/session.schema';
import { PostLike } from '../../likes/domain/post.like.schema';
import { CommentLike } from '../../likes/domain/comment.like.schema';

export class UserModel {
	id: string;
	login: string;
	email: string;
	password: string;
	salt: string;
	confirmationCode: string;
	expirationDate: Date;
	isConfirmed: boolean;
	isBanned: boolean;
	banReason: string;
	banDate: string;
	createdAt: string;
}

@Entity()
export class User {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	login: string;

	@Column()
	email: string;

	@Column()
	password: string;

	@Column()
	salt: string;

	@Column()
	confirmationCode: string;

	@Column()
	expirationDate: Date;

	@Column()
	isConfirmed: boolean;

	@Column()
	isBanned: boolean;

	@Column()
	banReason: string;

	@Column()
	banDate: string;

	@Column()
	createdAt: string;

	@OneToMany(() => Blog, (b) => b.userId)
	blogs: Blog[];

	@OneToMany(() => Comment, (c) => c.userId)
	comments: Comment[];

	@OneToMany(() => Session, (c) => c.userId)
	sessions: Session[];

	@OneToMany(() => PostLike, (c) => c.userId)
	postLikes: PostLike[];

	@OneToMany(() => CommentLike, (c) => c.userId)
	commentLikes: CommentLike[];
}
