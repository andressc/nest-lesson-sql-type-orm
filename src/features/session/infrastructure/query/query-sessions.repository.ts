import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Session, SessionModel } from '../../domain/session.schema';
import { QuerySessionsRepositoryInterface } from '../../interfaces/query.sessions.repository.interface';

@Injectable()
export class QuerySessionsRepository implements QuerySessionsRepositoryInterface {
	constructor(
		@InjectModel(Session.name)
		private readonly sessionModel: Model<SessionModel>,
	) {}

	async findAllSessionsByuserId(currentuserId: string): Promise<SessionModel[]> {
		return this.sessionModel.find({
			userId: currentuserId,
		});
	}
}
