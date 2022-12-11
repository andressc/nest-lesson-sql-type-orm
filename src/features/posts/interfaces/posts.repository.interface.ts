import { CreatePostExtendsDto } from '../dto';
import { PostModel } from '../domain/post.schema';
import { MainRepositoryInterface } from '../../shared/interfaces/main.repository.interface';
import { UpdatePostOfBlogDto } from '../dto/update-post-of-blog.dto';

/* eslint-disable */
export interface PostsRepositoryInterface
	extends MainRepositoryInterface<PostModel, CreatePostExtendsDto> {
	setBan(blogId: string, isBanned: boolean): Promise<void>
	update(updateData: UpdatePostOfBlogDto, blogId: string): Promise<void>
}
