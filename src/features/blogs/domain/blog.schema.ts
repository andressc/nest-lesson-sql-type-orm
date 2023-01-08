import { User } from 'src/features/users/domain/user.schema';
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Post } from '../../posts/domain/post.schema';
import { Comment } from '../../comments/domain/comment.schema';

export class BlogModel {
	id: string;
	name: string;
	websiteUrl: string;
	createdAt: string;
	description: string;
	userId: string;
	userLogin: string;
	isBanned: boolean;
	banDate: string;
}

@Entity()
export class Blog {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	name: string;

	@Column()
	websiteUrl: string;

	@Column()
	createdAt: string;

	@Column()
	description: string;

	@Column()
	userLogin: string;

	@Column()
	isBanned: boolean;

	@Column()
	banDate: string;

	@ManyToOne(() => User, (u) => u.blogs)
	userId: User;

	@OneToMany(() => Post, (p) => p.blogId)
	posts: Post[];

	@OneToMany(() => Comment, (c) => c.blogId)
	comments: Comment[];
}
