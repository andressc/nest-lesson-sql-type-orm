import {
	registerDecorator,
	ValidationOptions,
	ValidatorConstraint,
	ValidatorConstraintInterface,
} from 'class-validator';
import { Inject, Injectable } from '@nestjs/common';
import { BlogModel } from '../../../features/blogs/domain/blog.schema';
import { BlogsRepositoryInterface } from '../../../features/blogs/interfaces/blogs.repository.interface';
import { BlogInjectionToken } from '../../../features/blogs/infrastructure/providers/blog.injection.token';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsUserCommentValidatorConstraint implements ValidatorConstraintInterface {
	constructor(
		@Inject(BlogInjectionToken.BLOG_REPOSITORY)
		private readonly blogsRepository: BlogsRepositoryInterface,
	) {}

	async validate(blogId: string): Promise<boolean> {
		const blog: BlogModel | null = await this.blogsRepository.find(blogId);
		if (!blog) return false;

		return true;
	}

	defaultMessage(): string {
		return 'Blog not found';
	}
}

export function ValidateBlogIdDecorator(validationOptions?: ValidationOptions) {
	return function (object: any, propertyName: string) {
		registerDecorator({
			name: 'IsUserComment',
			target: object.constructor,
			propertyName: propertyName,
			options: validationOptions,
			validator: IsUserCommentValidatorConstraint,
		});
	};
}
