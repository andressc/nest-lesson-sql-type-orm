import { Injectable } from '@nestjs/common';
import { SessionModel } from '../../domain/session.schema';
import { QuerySessionsRepositoryInterface } from '../../interfaces/query.sessions.repository.interface';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class QuerySessionsRepository implements QuerySessionsRepositoryInterface {
	constructor(@InjectDataSource() protected dataSource: DataSource) {}

	async findAllSessionsByUserId(currentUserId: string): Promise<SessionModel[]> {
		return this.dataSource.query(`SELECT * FROM "Sessions" WHERE "userId"=$1`, [currentUserId]);
	}
}
