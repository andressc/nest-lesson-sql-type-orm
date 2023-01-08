import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/domain/user.schema';
import { Blog } from './blog.schema';

export class BanModel {
	id: string;
	userId: string;
	blogId: string;
	login: string;
	blogName: string;
	isBanned: boolean;
	banReason: string;
	banDate: string;
	createdAt: string;
}

@Entity()
export class Ban {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => User)
	userId: User;

	@ManyToOne(() => Blog)
	blogId: Blog;

	@Column()
	isBanned: boolean;

	@Column()
	banReason: string;

	@Column()
	banDate: string;

	@Column()
	createdAt: string;
}
