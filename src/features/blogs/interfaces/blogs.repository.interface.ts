import { MainRepositoryInterface } from '../../shared/interfaces/main.repository.interface';
import { BlogModel } from '../domain/blog.schema';
import { CreateBlogExtendsDto, UpdateBlogDto } from '../dto';
import { BanModel } from '../domain/ban.schema';
import { BanUnbanBlogOfUserExtendsDto } from '../dto/ban-unban-blog-of-user-extends.dto';

/* eslint-disable */
export interface BlogsRepositoryInterface
	extends MainRepositoryInterface<BlogModel, CreateBlogExtendsDto> {
	update(updateData: UpdateBlogDto, blogId: string): Promise<void>
	bindBlogWithUser(userId: string, userLogin: string, blogId: string): Promise<void>
	banBlog(isBanned: boolean, banDate: string, blogId: string): Promise<void>
	findBanByblogIdAnduserId(blogId: string, userId: string): Promise<BanModel | null>
	createBanModel(data: BanUnbanBlogOfUserExtendsDto): Promise<BanModel>
	saveBanModel(model: BanModel): Promise<BanModel>
	deleteAllBan(): Promise<void>
}
