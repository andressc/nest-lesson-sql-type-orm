import { Inject, Injectable } from '@nestjs/common';
import { PostModel } from '../domain/post.schema';
import { PostNotFoundException } from '../../../common/exceptions';
import { PostsRepositoryInterface } from '../interfaces/posts.repository.interface';
import { PostInjectionToken } from '../infrastructure/providers/post.injection.token';

@Injectable()
export class PostsService {
	constructor(
		@Inject(PostInjectionToken.POST_REPOSITORY)
		private readonly postsRepository: PostsRepositoryInterface,
	) {}

	public async findPostOrErrorThrow(id: string): Promise<PostModel> {
		const post: PostModel | null = await this.postsRepository.find(id);
		if (!post) throw new PostNotFoundException(id);
		return post;
	}
}
