import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

//export type BanModel = Ban & Document;

export class BanModel {
	id: string;
	userId: string;
	blogId: string;
	login: string;
	blogName: string;
	isBanned: boolean;
	banReason: string;
	banDate: string;
	createdAt: string;
}

@Schema()
export class Ban {
	@Prop({ required: true })
	userId: string;

	@Prop({ required: true })
	login: string;

	@Prop({ required: true })
	blogId: string;

	@Prop({ required: true })
	blogName: string;

	@Prop({ default: false })
	isBanned: boolean;

	@Prop({ default: null })
	banReason: string;

	@Prop({ default: null })
	banDate: string;

	banUnbanUser(isBanned, banReason, banDate): void {
		this.isBanned = isBanned;
		this.banReason = !isBanned ? null : banReason;
		this.banDate = !isBanned ? null : banDate;
	}
}

export const BanSchema = SchemaFactory.createForClass(Ban);

BanSchema.methods.banUnbanUser = Ban.prototype.banUnbanUser;
