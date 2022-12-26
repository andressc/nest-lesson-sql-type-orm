import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
	imports: [
		TypeOrmModule.forRootAsync({
			useFactory: (configService: ConfigService) => {
				if (configService.get<string>('NODE_ENV') === 'test') {
					return {
						type: 'postgres',
						host: 'localhost',
						port: 5433,
						username: 'postgres',
						password: 'sa',
						database: 'Lesson',
						autoLoadEntities: false,
						synchronize: false,
					};
				}

				return {
					type: 'postgres',
					host: 'ep-divine-glitter-102279.us-east-2.aws.neon.tech',
					port: 5432,
					username: 'andressc',
					password: 'e2Ji8jTuSPok',
					database: 'neondb',
					autoLoadEntities: false,
					synchronize: false,
					ssl: true,
				};
			},
			inject: [ConfigService],
		}),
	],
})
export class DatabaseSqlModule {}
