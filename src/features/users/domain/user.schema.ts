import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Blog } from '../../blogs/domain/blog.schema';

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
}
