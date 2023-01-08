import { User } from 'src/features/users/domain/user.schema';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

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

	@ManyToOne(() => User, (u) => u.blogs)
	userId: User;

	@Column()
	userLogin: string;

	@Column()
	isBanned: boolean;

	@Column()
	banDate: string;
}
