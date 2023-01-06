import { CreatePostExtendsDto } from '../dto';
import { PostModel } from '../domain/post.schema';
import { UpdatePostOfBlogDto } from '../dto/update-post-of-blog.dto';

export interface PostsRepositoryInterface {
	setBan(blogId: string, isBanned: boolean): Promise<void>;
	update(updateData: UpdatePostOfBlogDto, blogId: string): Promise<void>;
	create(data: CreatePostExtendsDto): Promise<PostModel>;
	find(id: string): Promise<PostModel | null>;
	delete(model: PostModel): Promise<void>;
	deleteAll(): Promise<void>;
}
