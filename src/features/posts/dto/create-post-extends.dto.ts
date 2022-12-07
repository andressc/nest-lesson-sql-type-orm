import { CreatePostDto } from './create-post.dto';

export class CreatePostExtendsDto extends CreatePostDto {
	blogName: string;
	bloguserId: string;
	createdAt: string;
}
