import { Injectable } from '@nestjs/common';
import { SessionModel } from '../../domain/session.schema';
import { QuerySessionsRepositoryInterface } from '../../interfaces/query.sessions.repository.interface';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ResponseSessionDto } from '../../dto/response-session.dto';

@Injectable()
export class QuerySessionsRepository implements QuerySessionsRepositoryInterface {
	constructor(@InjectDataSource() protected dataSource: DataSource) {}

	async findAllSessionsByUserId(currentUserId: string): Promise<ResponseSessionDto[]> {
		const session = await this.dataSource.query(`SELECT * FROM "Sessions" WHERE "userId"=$1`, [
			currentUserId,
		]);

		return session.map((v: SessionModel) => ({
			ip: v.ip,
			title: v.title,
			lastActiveDate: v.lastActiveDate,
			deviceId: v.deviceId,
		}));
	}
}
