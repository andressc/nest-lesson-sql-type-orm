import { TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { mainTest } from '../src/main-test';
import request from 'supertest';
import { ObjectId } from 'mongodb';
import { BASIC_AUTH } from './helpers/constants';
import { Connection } from 'typeorm';
import { clearDb } from './helpers/clearDb';

describe('SessionController (e2e)', () => {
	let dataApp: { app: INestApplication; module: TestingModule; connection: Connection };

	let connection: Connection;
	let app: INestApplication;
	//let module: TestingModule;

	const userDataLogin = {
		login: 'login',
		email: 'email@email.ru',
		password: '123456',
	};

	const userDataLogin2 = {
		login: 'login2',
		email: 'email2@email.ru',
		password: '123456',
	};

	const sessionData = {
		ip: expect.any(String),
		title: 'test1',
		lastActiveDate: expect.any(String),
		deviceId: expect.any(String),
	};

	const randomId = new ObjectId().toString();

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

	describe('sessions', () => {
		beforeAll(async () => {
			await clearDb(connection);
		});

		let refreshToken;
		let deviceId;

		let refreshTokenOtherUser;
		let deviceIdOtherUser;

		it('create new user 1', async () => {
			await request(app)
				.post('/sa/users')
				.set('authorization', BASIC_AUTH)
				.send(userDataLogin)
				.expect(201);
		});

		it('create new user 2', async () => {
			await request(app)
				.post('/sa/users')
				.set('authorization', BASIC_AUTH)
				.send(userDataLogin2)
				.expect(201);
		});

		it('the first login', async () => {
			const tokens = await request(app)
				.post('/auth/login')
				.set('user-agent', 'test1')
				.send({
					loginOrEmail: userDataLogin.login,
					password: userDataLogin.password,
				})
				.expect(200);

			expect(tokens.body).toEqual({
				accessToken: expect.any(String),
			});

			refreshToken = tokens.get('Set-Cookie')[0];
		});

		it('the second login', async () => {
			const tokens = await request(app)
				.post('/auth/login')
				.set('user-agent', 'test3')
				.send({
					loginOrEmail: userDataLogin.login,
					password: userDataLogin.password,
				})
				.expect(200);

			expect(tokens.body).toEqual({
				accessToken: expect.any(String),
			});

			refreshToken = tokens.get('Set-Cookie')[0];
		});

		it('the third login', async () => {
			const tokens = await request(app)
				.post('/auth/login')
				.set('user-agent', 'test2')
				.send({
					loginOrEmail: userDataLogin.login,
					password: userDataLogin.password,
				})
				.expect(200);

			expect(tokens.body).toEqual({
				accessToken: expect.any(String),
			});

			refreshToken = tokens.get('Set-Cookie')[0];
		});

		it('the other user login', async () => {
			const tokens = await request(app)
				.post('/auth/login')
				.set('user-agent', 'testOtherUser')
				.send({
					loginOrEmail: userDataLogin2.login,
					password: userDataLogin2.password,
				})
				.expect(200);

			expect(tokens.body).toEqual({
				accessToken: expect.any(String),
			});

			refreshTokenOtherUser = tokens.get('Set-Cookie')[0];
		});

		it('get all other user sessions', async () => {
			const sessions = await request(app)
				.get('/security/devices')
				.set('Cookie', [refreshTokenOtherUser])
				.expect(200);

			expect(sessions.body).toEqual([{ ...sessionData, title: 'testOtherUser' }]);
			deviceIdOtherUser = sessions.body[0].deviceId;
		});

		it('get all user sessions', async () => {
			const sessions = await request(app)
				.get('/security/devices')
				.set('Cookie', [refreshToken])
				.expect(200);

			expect(sessions.body).toEqual([
				{ ...sessionData, title: 'test1' },
				{ ...sessionData, title: 'test3' },
				{ ...sessionData, title: 'test2' },
			]);
		});

		it('terminate all other (exclude current) sessions', async () => {
			await request(app).delete('/security/devices').set('Cookie', [refreshToken]).expect(204);
		});

		it('get all user sessions after deleting', async () => {
			const sessions = await request(app)
				.get('/security/devices')
				.set('Cookie', [refreshToken])
				.expect(200);

			expect(sessions.body).toEqual([{ ...sessionData, title: 'test2' }]);

			deviceId = sessions.body[0].deviceId;
		});

		it('delete a non-existent device session', async () => {
			await request(app)
				.delete(`/security/devices/${randomId}`)
				.set('Cookie', [refreshToken])
				.expect(404);
		});

		it('terminate specific device session other user', async () => {
			await request(app)
				.delete(`/security/devices/${deviceIdOtherUser}`)
				.set('Cookie', [refreshToken])
				.expect(403);
		});

		it('terminate specific device session', async () => {
			await request(app)
				.delete(`/security/devices/${deviceId}`)
				.set('Cookie', [refreshToken])
				.expect(204);
		});

		it('get all user sessions after deleting specific device', async () => {
			await request(app).get('/security/devices').set('Cookie', [refreshToken]).expect(401);
		});
	});

	describe('If the JWT refreshToken inside cookie is missing, expired or incorrect', () => {
		beforeAll(async () => {
			await clearDb(connection);
		});

		it('terminate all other (exclude current) sessions', async () => {
			await request(app).delete('/security/devices').expect(401);
		});

		it('terminate specific device session', async () => {
			await request(app).delete(`/security/devices/${randomId}`).expect(401);
		});
	});
});
