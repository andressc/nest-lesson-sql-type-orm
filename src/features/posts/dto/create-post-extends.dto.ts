import { CreatePostDto } from './create-post.dto';

export class CreatePostExtendsDto extends CreatePostDto {
	blogName: string;
	blogUserId: string;
	createdAt: string;
}
