import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/domain/user.schema';
import { Blog } from '../../blogs/domain/blog.schema';
import { Post } from '../../posts/domain/post.schema';
import { CommentLike } from '../../likes/domain/comment.like.schema';

export class CommentModel {
	id: string;
	content: string;
	userId: string;
	login: string;
	postId: string;
	//blogUserId: string;
	title: string;
	blogId: string;
	name: string;
	createdAt: string;
	isBanned: boolean;
	//likes: LikesDto[];
	likes: number;
	dislikes: number;
	status: string | null;
}

@Entity()
export class Comment {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	content: string;

	@Column()
	createdAt: string;

	@Column()
	isBanned: boolean;

	@ManyToOne(() => User, (u) => u.comments)
	userId: User;

	@ManyToOne(() => Post, (p) => p.posts)
	postId: Post;

	@ManyToOne(() => Blog, (b) => b.comments)
	blogId: Blog;

	@OneToMany(() => CommentLike, (cl) => cl.postId)
	likes: CommentLike[];
}
