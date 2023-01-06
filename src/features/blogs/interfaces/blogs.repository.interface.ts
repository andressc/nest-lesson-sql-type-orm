import { BlogModel } from '../domain/blog.schema';
import { CreateBlogExtendsDto, UpdateBlogDto } from '../dto';
import { BanModel } from '../domain/ban.schema';
import { BanUnbanBlogOfUserExtendsDto } from '../dto/ban-unban-blog-of-user-extends.dto';

export interface BlogsRepositoryInterface {
	create(data: CreateBlogExtendsDto): Promise<BlogModel>;
	find(id: string): Promise<BlogModel | null>;
	delete(model: BlogModel): Promise<void>;
	deleteAll(): Promise<void>;
	update(updateData: UpdateBlogDto, blogId: string): Promise<void>;
	bindBlogWithUser(userId: string, userLogin: string, blogId: string): Promise<void>;
	banBlog(isBanned: boolean, banDate: string, blogId: string): Promise<void>;
	findBanByBlogIdAndUserId(blogId: string, userId: string): Promise<BanModel | null>;
	createBanModel(data: BanUnbanBlogOfUserExtendsDto): Promise<BanModel>;
	saveBanModel(model: BanModel): Promise<BanModel>;
	deleteAllBan(): Promise<void>;
	banUserOfBlog(
		isBanned: boolean,
		banReason: string,
		banDate: string,
		bannedId: string,
	): Promise<void>;
}
