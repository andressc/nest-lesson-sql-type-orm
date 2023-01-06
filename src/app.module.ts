import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { ThrottlerLimitModule } from './shared/throttler/throttler.module';
import { ValidationModule } from './shared/validation/validation.module';
import { AuthModule } from './features/auth/auth.module';
import { TestingModule } from './features/testing/testing.module';
import { DatabaseSqlModule } from './shared/database/database.sql.module';
import { BlogsPostsCommentsModule } from './features/blogs.posts.comments.module';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: ['.env.local', '.env'],
		}),
		BlogsPostsCommentsModule,
		TestingModule,
		AuthModule,
		ThrottlerLimitModule,
		DatabaseSqlModule,
		ValidationModule,
	],
	controllers: [],
	providers: [],
})
export class AppModule {}
