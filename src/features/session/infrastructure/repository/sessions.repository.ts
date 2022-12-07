import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { SessionsRepositoryInterface } from '../../interfaces/sessions.repository.interface';
import { Session, SessionModel } from '../../domain/session.schema';
import { CreateSessionDto } from '../../dto/create-session.dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class SessionsRepository implements SessionsRepositoryInterface {
	constructor(
		@InjectDataSource() protected dataSource: DataSource,
		@InjectModel(Session.name)
		private readonly sessionModel: Model<SessionModel>,
	) {}

	async create(data: CreateSessionDto): Promise<SessionModel> {
		const session = await this.dataSource.query(
			`INSERT INTO public."Sessions"(ip, title, "lastActiveDate", "expirationDate", "deviceId", "userId")
			 VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;`,
			[data.ip, data.title, data.lastActiveDate, data.expirationDate, data.deviceId, data.userId],
		);

		return session[0];
	}

	async find(id: string): Promise<SessionModel | null> {
		const session = await this.dataSource.query(`SELECT * FROM "Sessions" WHERE "id"=$1`, [id]);
		return session[0];
	}

	async save(model: SessionModel): Promise<SessionModel> {
		//return model.save();
		return model;
	}

	async delete(model: SessionModel): Promise<void> {
		await this.dataSource.query(`DELETE FROM "Sessions" WHERE "id"=$1`, [model.id]);
	}

	async deleteAll(): Promise<void> {
		await this.dataSource.query(`DELETE FROM "Sessions"`);
	}

	async findSession(
		userId: string,
		deviceId: string,
		lastActiveDate: string,
	): Promise<SessionModel | null> {
		const session = await this.dataSource.query(
			`SELECT * FROM "Sessions" WHERE "userId"=$1 AND "deviceId"=$2 AND "lastActiveDate"=$3 LIMIT 1`,
			[userId, deviceId, lastActiveDate],
		);
		return session[0];
	}

	async update(
		lastActiveDate: string,
		expirationDate: string,
		ip: string,
		userAgent: string,
		sessionId: string,
	): Promise<void> {
		await this.dataSource.query(
			`UPDATE "Sessions" SET "lastActiveDate"=$1, "expirationDate"=$2, "ip"=$3, "userAgent"=$4 WHERE "id"=$5`,
			[lastActiveDate, expirationDate, ip, userAgent, sessionId],
		);
	}

	async findSessionOnDeviceId(deviceId: string): Promise<SessionModel | null> {
		const session = await this.dataSource.query(`SELECT * FROM "Sessions" WHERE "deviceId"=$1`, [
			deviceId,
		]);
		return session[0];
	}

	async removeAllUserSessionsExceptCurrent(userId: string, deviceId: string): Promise<void> {
		await this.dataSource.query(`DELETE FROM "Sessions" WHERE "userId"=$1 AND "deviceId"!=$2`, [
			userId,
			deviceId,
		]);
	}

	async removeAllUserSessions(userId: string): Promise<void> {
		await this.dataSource.query(`DELETE FROM "Sessions" WHERE "userId"=$1`, [userId]);
	}
}
