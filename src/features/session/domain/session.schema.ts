import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/domain/user.schema';

export class SessionModel {
	id: string;
	ip: string;
	title: string;
	userAgent: string;
	lastActiveDate: string;
	expirationDate: string;
	deviceId: string;
	userId: string;
}

@Entity()
export class Session {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	ip: string;

	@Column()
	title: string;

	@Column()
	userAgent: string;

	@Column()
	lastActiveDate: string;

	@Column()
	expirationDate: string;

	@Column()
	deviceId: string;

	@ManyToOne(() => User, (u) => u.sessions)
	userId: User;
}
