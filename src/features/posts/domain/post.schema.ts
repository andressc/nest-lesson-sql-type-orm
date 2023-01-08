import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Blog } from '../../blogs/domain/blog.schema';
import { Comment } from '../../comments/domain/comment.schema';
import { PostLike } from '../../likes/domain/post.like.schema';

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

@Entity()
export class Post {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	title: string;

	@Column()
	shortDescription: string;

	@Column()
	content: string;

	@Column()
	isBanned: boolean;

	@Column()
	createdAt: string;

	@ManyToOne(() => Blog, (b) => b.posts)
	blogId: Blog;

	@OneToMany(() => Comment, (c) => c.postId)
	posts: Comment[];

	@OneToMany(() => PostLike, (pl) => pl.postId)
	likes: PostLike[];
}
