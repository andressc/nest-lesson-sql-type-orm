import { TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { mainTest } from '../src/main-test';
import request from 'supertest';
import { blogCreator } from './dbSeeding/blogCreator';
import { commentCreator } from './dbSeeding/commentCreator';
import { postCreator } from './dbSeeding/postCreator';
import { userCreator } from './dbSeeding/userCreator';
import { sessionCreator } from './dbSeeding/sessionCreator';
import { banCreator } from './dbSeeding/banCreator';
import { Connection } from 'typeorm';
import { clearDb } from './helpers/clearDb';
import { getRandomId } from './helpers/getRandomId';

describe('TestingController (e2e)', () => {
	let dataApp: { app: INestApplication; module: TestingModule; connection: Connection };

	let connection: Connection;
	let app: INestApplication;

	const postData = {
		shortDescription: 'shortDescription',
		content: 'content',
		blogId: getRandomId(),
		blogName: 'blogName',
		blogUserId: 'blogUserId',
	};

	beforeAll(async () => {
		dataApp = await mainTest();

		connection = dataApp.connection;
		app = dataApp.app.getHttpServer();
		//module = dataApp.module;
	});

	afterAll(async () => {
		//await connection.destroy();
		await dataApp.app.close();
		jest.resetModules();
	});

	describe('delete all data', () => {
		beforeAll(async () => {
			await clearDb(connection);

			await connection.query(postCreator('title', postData, 1));
			await connection.query(blogCreator('name', 1, 'youtubeUrl'));
			await connection.query(userCreator('login', 'email', 1));
			await connection.query(
				commentCreator('content', getRandomId(), 'userLogin', getRandomId(), 1),
			);
			await connection.query(sessionCreator());
			await connection.query(banCreator());
		});

		it('delete all', async () => {
			await request(app).delete('/testing/all-data').expect(204);
		});

		it('find after deleting', async () => {
			const postCount = await connection.query(`SELECT COUNT("id") AS "count" FROM "Posts"`);
			const blogCount = await connection.query(`SELECT COUNT("id") AS "count" FROM "Blogs"`);
			const userCount = await connection.query(`SELECT COUNT("id") AS "count" FROM "Users"`);
			const commentCount = await connection.query(`SELECT COUNT("id") AS "count" FROM "Comments"`);
			const sessionIpCount = await connection.query(
				`SELECT COUNT("id") AS "count" FROM "Sessions"`,
			);
			const banCount = await connection.query(`SELECT COUNT("id") AS "count" FROM "Ban"`);

			expect(postCount[0].count).toBe('0');
			expect(blogCount[0].count).toBe('0');
			expect(userCount[0].count).toBe('0');
			expect(commentCount[0].count).toBe('0');
			expect(sessionIpCount[0].count).toBe('0');
			expect(banCount[0].count).toBe('0');
		});
	});
});
