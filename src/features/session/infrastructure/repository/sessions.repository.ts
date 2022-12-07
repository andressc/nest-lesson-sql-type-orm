import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { SessionsRepositoryInterface } from '../../interfaces/sessions.repository.interface';
import { Session, SessionModel } from '../../domain/session.schema';
import { CreateSessionDto } from '../../dto/create-session.dto';

@Injectable()
export class SessionsRepository implements SessionsRepositoryInterface {
	constructor(
		@InjectModel(Session.name)
		private readonly sessionModel: Model<SessionModel>,
	) {}

	async create(data: CreateSessionDto): Promise<SessionModel> {
		return new this.sessionModel(data);
	}

	async find(id: string): Promise<SessionModel | null> {
		return this.sessionModel.findById(+id);
	}

	async save(model: SessionModel): Promise<SessionModel> {
		return model.save();
	}

	async delete(model: SessionModel): Promise<void> {
		await model.delete();
	}

	async deleteAll(): Promise<void> {
		await this.sessionModel.deleteMany();
	}

	async findSession(
		userId: string,
		deviceId: string,
		lastActiveDate: string,
	): Promise<SessionModel | null> {
		return this.sessionModel.findOne({
			userId,
			deviceId,
			lastActiveDate,
		});
	}

	async findSessionOndeviceId(deviceId: string): Promise<SessionModel | null> {
		return this.sessionModel.findOne({
			deviceId,
		});
	}

	async removeAllUserSessionsExceptCurrent(userId: string, deviceId: string): Promise<void> {
		await this.sessionModel.deleteMany({
			userId: { $eq: userId },
			deviceId: { $ne: deviceId },
		});
	}

	async removeAllUserSessions(userId: string): Promise<void> {
		await this.sessionModel.deleteMany({ userId });
	}
}
