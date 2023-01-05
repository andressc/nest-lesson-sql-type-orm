import { Injectable } from '@nestjs/common';
import { CreateUserExtendsDto } from '../../dto';
import { UserModel } from '../../domain/user.schema';
import { UsersRepositoryInterface } from '../../interfaces/users.repository.interface';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { generateHash } from '../../../../common/helpers';

@Injectable()
export class UsersRepository implements UsersRepositoryInterface {
	constructor(@InjectDataSource() protected dataSource: DataSource) {}

	async create(data: CreateUserExtendsDto): Promise<UserModel> {
		const user = await this.dataSource.query(
			`INSERT INTO "Users"(
"login", "email", "password", "salt", "confirmationCode", "expirationDate", "isConfirmed", "isBanned", "banReason", "banDate", "createdAt")
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *;`,
			[
				data.login,
				data.email,
				data.password,
				data.salt,
				data.confirmationCode,
				data.expirationDate,
				data.isConfirmed,
				false,
				null,
				null,
				data.createdAt,
			],
		);

		return user[0];
	}

	async find(id: string): Promise<UserModel | null> {
		const user = await this.dataSource.query(`SELECT * FROM "Users" WHERE "id"=$1`, [id]);
		return user[0];
	}

	async delete(model: UserModel): Promise<void> {
		await this.dataSource.query(`DELETE FROM "Users" WHERE "id"=$1`, [model.id]);
	}

	async deleteAll(): Promise<void> {
		await this.dataSource.query(`DELETE FROM "Users"`);
	}

	async updateIsConfirmed(IsConfirmed: boolean, userId: string): Promise<void> {
		await this.dataSource.query(`UPDATE "Users" SET "isConfirmed"=$1 WHERE "id"=$2`, [
			IsConfirmed,
			userId,
		]);
	}

	async updateConfirmationCode(confirmationCode: string, userId: string): Promise<void> {
		await this.dataSource.query(`UPDATE "Users" SET "confirmationCode"=$1 WHERE "id"=$2`, [
			confirmationCode,
			userId,
		]);
	}

	async updatePassword(password: string, userId: string): Promise<void> {
		const passwordSalt = await bcrypt.genSalt(10);
		const newPassword = await generateHash(password, passwordSalt);

		await this.dataSource.query(`UPDATE "Users" SET "password"=$1, salt=$2 WHERE "id"=$3`, [
			newPassword,
			passwordSalt,
			userId,
		]);
	}

	async banUnbanUser(isBanned: boolean, banReason: string, banDate: string, userId): Promise<void> {
		if (isBanned) {
			await this.dataSource.query(
				`UPDATE "Users" SET "isBanned"=true, "banReason"=$1, "banDate"=$2 WHERE "id" = $3`,
				[banReason, banDate, userId],
			);
		}

		if (!isBanned) {
			await this.dataSource.query(
				`UPDATE "Users" SET "isBanned"=false, "banReason"=null, "banDate"=null WHERE "id" = $1`,
				[userId],
			);
		}
	}

	async findUserByLogin(login: string): Promise<UserModel | null> {
		const user = await this.dataSource.query(`SELECT * FROM "Users" WHERE "login"=$1`, [login]);
		if (user.length === 0) return null;
		return user[0];
	}

	async findUserByEmail(email: string): Promise<UserModel | null> {
		const user = await this.dataSource.query(`SELECT * FROM "Users" WHERE "email"=$1`, [email]);
		return user[0];
	}

	async findUserByEmailOrLogin(emailOrLogin: string): Promise<UserModel | null> {
		const user = await this.dataSource.query(`SELECT * FROM "Users" WHERE "email"=$1 OR login=$1`, [
			emailOrLogin,
		]);
		if (user.length === 0) return null;
		return user[0];
	}

	async findUserByConfirmationCode(confirmationCode: string): Promise<UserModel | null> {
		const user = await this.dataSource.query(`SELECT * FROM "Users" WHERE "confirmationCode"=$1`, [
			confirmationCode,
		]);
		if (user.length === 0) return null;
		return user[0];
	}
}
