import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { DatabaseModule } from './shared/database/database.module';
import { ThrottlerLimitModule } from './shared/throttler/throttler.module';
import { ValidationModule } from './shared/validation/validation.module';
import { AuthModule } from './features/auth/auth.module';
import { CommentsModule } from './features/comments/comments.module';
import { TestingModule } from './features/testing/testing.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: ['.env.local', '.env'],
		}),
		/*TypeOrmModule.forRoot({
			type: 'postgres',
			host: 'localhost',
			port: 5433,
			username: 'postgres',
			password: 'sa',
			database: 'Lesson',
			autoLoadEntities: false,
			synchronize: false,
		}),*/
		TypeOrmModule.forRoot({
			type: 'postgres',
			host: 'ep-divine-glitter-102279.us-east-2.aws.neon.tech',
			port: 5432,
			username: 'andressc',
			password: 'e2Ji8jTuSPok',
			database: 'neondb',
			autoLoadEntities: false,
			synchronize: false,
			ssl: true,
		}),
		CommentsModule,
		TestingModule,
		AuthModule,
		ThrottlerLimitModule,
		DatabaseModule,
		ValidationModule,
	],
	controllers: [],
	providers: [],
})
export class AppModule {}
