import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { generateHash } from '../../../common/helpers';

//export type UserModel = User & Document;

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

@Schema()
export class User {
	@Prop({ required: true })
	login: string;

	@Prop({ required: true })
	email: string;

	@Prop({ required: true })
	password: string;

	@Prop({ required: true })
	salt: string;

	@Prop({ required: true })
	confirmationCode: string;

	@Prop({ required: true })
	expirationDate: Date;

	@Prop({ required: true })
	isConfirmed: boolean;

	@Prop({ default: false })
	isBanned: boolean;

	@Prop({ default: null })
	banReason: string;

	@Prop({ default: null })
	banDate: string;

	@Prop({ required: true })
	createdAt: string;

	banUnbanUser(isBanned, banReason, banDate): void {
		this.isBanned = isBanned;
		this.banReason = !isBanned ? null : banReason;
		this.banDate = !isBanned ? null : banDate;
	}

	updateIsConfirmed(isConfirmed: boolean): void {
		this.isConfirmed = isConfirmed;
	}

	updateConfirmationCode(confirmationCode: string): void {
		this.confirmationCode = confirmationCode;
	}

	async updatePassword(password: string): Promise<void> {
		const passwordSalt = await bcrypt.genSalt(10);
		this.password = await generateHash(password, passwordSalt);
		this.salt = passwordSalt;
	}
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.methods.updateIsConfirmed = User.prototype.updateIsConfirmed;
UserSchema.methods.updateConfirmationCode = User.prototype.updateConfirmationCode;
UserSchema.methods.updatePassword = User.prototype.updatePassword;
UserSchema.methods.banUnbanUser = User.prototype.banUnbanUser;
