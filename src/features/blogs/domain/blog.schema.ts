//export type BlogModel = Blog & Document;

export class BlogModel {
	id: string;
	name: string;
	websiteUrl: string;
	createdAt: string;
	description: string;
	userId: string;
	userLogin: string;
	isBanned: boolean;
	banDate: string;
}

/*@Schema()
export class Blog {
	@Prop({ required: true })
	name: string;

	@Prop({ required: true })
	websiteUrl: string;

	@Prop({ required: true })
	createdAt: string;

	@Prop({ required: true })
	description: string;

	@Prop({ required: true })
	userId: string;

	@Prop({ required: true })
	userLogin: string;

	@Prop({ default: false })
	isBanned: boolean;

	@Prop({ default: null })
	banDate: string;

	updateData(data: UpdateBlogDto): void {
		this.name = data.name;
		this.description = data.description;
		this.websiteUrl = data.websiteUrl;
	}

	ban(isBanned: boolean, banDate: string | null): void {
		this.isBanned = isBanned;
		this.banDate = banDate;
	}

	bindBlogWithUser(userId: string, userLogin: string): void {
		//this.userId = userId;
		this.userLogin = userLogin;
	}
}

export const BlogSchema = SchemaFactory.createForClass(Blog);

BlogSchema.methods.updateData = Blog.prototype.updateData;
BlogSchema.methods.bindBlogWithUser = Blog.prototype.bindBlogWithUser;
BlogSchema.methods.ban = Blog.prototype.ban;*/
