import { TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { mainTest } from '../src/main-test';
import { userCreator } from './dbSeeding/userCreator';
import { BASIC_AUTH } from './helpers/constants';
import { Connection } from 'typeorm';
import { getRandomId } from './helpers/getRandomId';
import { clearDb } from './helpers/clearDb';

describe('UserController (e2e)', () => {
	let dataApp: { app: INestApplication; module: TestingModule; connection: Connection };
	let connection: Connection;
	let app: INestApplication;

	const randomId = getRandomId();

	const userDataLogin = {
		login: 'login',
		password: 'password',
		email: 'mail@mail.ru',
	};

	const userData = {
		id: expect.any(String),
		login: 'login',
		email: 'mail@mail.ru',
		createdAt: expect.any(String),
		banInfo: {
			isBanned: expect.any(Boolean),
			banDate: null,
			banReason: null,
		},
	};

	const userErrorsMessages = {
		errorsMessages: [
			{
				field: 'login',
				message: expect.any(String),
			},
			{
				field: 'password',
				message: expect.any(String),
			},
			{
				field: 'email',
				message: expect.any(String),
			},
		],
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
	});

	describe('add, get, delete new user', () => {
		beforeAll(async () => {
			await clearDb(connection);
		});

		let userId;

		it('should return 200 and all user null', async () => {
			const response = await request(app)
				.get('/sa/users')
				.set('authorization', BASIC_AUTH)
				.expect(200);

			expect(response.body).toEqual({
				pagesCount: 0,
				page: 1,
				pageSize: 10,
				totalCount: 0,
				items: [],
			});
		});

		it('add new user', async () => {
			const user = await request(app)
				.post('/sa/users')
				.set('authorization', BASIC_AUTH)
				.send(userDataLogin)
				.expect(201);

			expect(user.body).toEqual(userData);

			userId = user.body.id;
		});

		it('get all users after add', async () => {
			const allUsers = await request(app)
				.get(`/sa/users`)
				.set('authorization', BASIC_AUTH)
				.expect(200);
			expect(allUsers.body).toEqual({
				pagesCount: 1,
				page: 1,
				pageSize: 10,
				totalCount: 1,
				items: [userData],
			});
		});

		it('delete user by id', async () => {
			await request(app).delete(`/sa/users/${userId}`).set('authorization', BASIC_AUTH).expect(204);
		});

		it('should return 200 and all user null after delete', async () => {
			const response = await request(app)
				.get(`/sa/users`)
				.set('authorization', BASIC_AUTH)
				.expect(200);

			expect(response.body).toEqual({
				pagesCount: 0,
				page: 1,
				pageSize: 10,
				totalCount: 0,
				items: [],
			});
		});

		it('delete a user that does not exist', async () => {
			await request(app)
				.delete(`/sa/users/${randomId}`)
				.set('authorization', BASIC_AUTH)
				.expect(404);
		});
	});

	describe('add new user incorrect data', () => {
		beforeAll(async () => {
			await clearDb(connection);
		});

		it('add new user wrong body data', async () => {
			const addBlogError = await request(app)
				.post('/sa/users')
				.set('authorization', BASIC_AUTH)
				.expect(400);

			expect(addBlogError.body).toEqual(userErrorsMessages);
		});

		it('add new user', async () => {
			await request(app)
				.post('/sa/users')
				.set('authorization', BASIC_AUTH)
				.send(userDataLogin)
				.expect(201);
		});

		it('add a user that already exists login', async () => {
			const user = await request(app)
				.post('/sa/users')
				.set('authorization', BASIC_AUTH)
				.send({ ...userDataLogin, email: 'email2@mail.ru' })
				.expect(400);

			expect(user.body).toEqual({
				errorsMessages: [
					{
						field: 'login',
						message: expect.any(String),
					},
				],
			});
		});

		it('add a user that already exists email', async () => {
			const user = await request(app)
				.post('/sa/users')
				.set('authorization', BASIC_AUTH)
				.send({ ...userDataLogin, login: 'login2' })
				.expect(400);

			expect(user.body).toEqual({
				errorsMessages: [
					{
						field: 'email',
						message: expect.any(String),
					},
				],
			});
		});

		it('add a user that already exists email and login', async () => {
			const user = await request(app)
				.post('/sa/users')
				.set('authorization', BASIC_AUTH)
				.send(userDataLogin)
				.expect(400);

			expect(user.body).toEqual({
				errorsMessages: [
					{
						field: 'login',
						message: expect.any(String),
					},
				],
			});
		});
	});

	describe('add, delete, get user with not authorized basic', () => {
		beforeAll(async () => {
			await clearDb(connection);
		});

		it('get users with not authorized basic', async () => {
			await request(app).get(`/sa/users`).set('authorization', 'wrongAuth').expect(401);
		});

		it('add user with not authorized basic', async () => {
			await request(app)
				.post('/sa/users')
				.set('authorization', 'wrongAuth')
				.send(userDataLogin)
				.expect(401);
		});

		it('delete user with not authorized basic', async () => {
			await request(app)
				.delete(`/sa/users/${randomId}`)
				.set('authorization', 'wrongAuth')
				.expect(401);
		});
	});

	describe('get all users sorting', () => {
		beforeAll(async () => {
			await clearDb(connection);

			await connection.query(userCreator('aLogin', userData.email, 1));
			await connection.query(userCreator('cLogin', userData.email, 2));
			await connection.query(userCreator('bLogin', userData.email, 3));
		});

		it('should return 200 and all users', async () => {
			const response = await request(app)
				.get('/sa/users')
				.set('authorization', BASIC_AUTH)
				.expect(200);

			expect(response.body).toEqual({
				pagesCount: 1,
				page: 1,
				pageSize: 10,
				totalCount: 3,
				items: [
					{ ...userData, login: 'bLogin' },
					{ ...userData, login: 'cLogin' },
					{ ...userData, login: 'aLogin' },
				],
			});
		});

		it('sorting and pages users', async () => {
			const response = await request(app)
				.get('/sa/users?sortBy=login&pageSize=2&sortDirection=asc')
				.set('authorization', BASIC_AUTH)
				.expect(200);

			expect(response.body).toEqual({
				pagesCount: 2,
				page: 1,
				pageSize: 2,
				totalCount: 3,
				items: [
					{ ...userData, login: 'aLogin' },
					{ ...userData, login: 'bLogin' },
				],
			});
		});
	});

	describe('search users', () => {
		beforeAll(async () => {
			await clearDb(connection);

			await connection.query(userCreator('aLogin', 'aemail@email.ru', 1));
			await connection.query(userCreator('cLogin', 'bemail@email.ru', 2));
			await connection.query(userCreator('bLogin', 'cemail@email.ru', 3));
		});

		it('search users from login first step', async () => {
			const response = await request(app)
				.get('/sa/users?searchLoginTerm=bLogin')
				.set('authorization', BASIC_AUTH)
				.expect(200);

			expect(response.body).toEqual({
				pagesCount: 1,
				page: 1,
				pageSize: 10,
				totalCount: 1,
				items: [{ ...userData, login: 'bLogin', email: 'cemail@email.ru' }],
			});
		});

		it('search users from login second step', async () => {
			const response = await request(app)
				.get('/sa/users?searchLoginTerm=login')
				.set('authorization', BASIC_AUTH)
				.expect(200);

			expect(response.body).toEqual({
				pagesCount: 1,
				page: 1,
				pageSize: 10,
				totalCount: 3,
				items: [
					{ ...userData, login: 'bLogin', email: 'cemail@email.ru' },
					{ ...userData, login: 'cLogin', email: 'bemail@email.ru' },
					{ ...userData, login: 'aLogin', email: 'aemail@email.ru' },
				],
			});
		});

		it('search users from email first step', async () => {
			const response = await request(app)
				.get('/sa/users?searchEmailTerm=cemail@email.ru')
				.set('authorization', BASIC_AUTH)
				.expect(200);

			expect(response.body).toEqual({
				pagesCount: 1,
				page: 1,
				pageSize: 10,
				totalCount: 1,
				items: [{ ...userData, login: 'bLogin', email: 'cemail@email.ru' }],
			});
		});

		it('search users from email second step', async () => {
			const response = await request(app)
				.get('/sa/users?searchEmailTerm=Email')
				.set('authorization', BASIC_AUTH)
				.expect(200);

			expect(response.body).toEqual({
				pagesCount: 1,
				page: 1,
				pageSize: 10,
				totalCount: 3,
				items: [
					{ ...userData, login: 'bLogin', email: 'cemail@email.ru' },
					{ ...userData, login: 'cLogin', email: 'bemail@email.ru' },
					{ ...userData, login: 'aLogin', email: 'aemail@email.ru' },
				],
			});
		});

		it('search users from email and login first step', async () => {
			const response = await request(app)
				.get('/sa/users?searchEmailTerm=cemai&searchLoginTerm=bLog')
				.set('authorization', BASIC_AUTH)
				.expect(200);

			expect(response.body).toEqual({
				pagesCount: 1,
				page: 1,
				pageSize: 10,
				totalCount: 1,
				items: [{ ...userData, login: 'bLogin', email: 'cemail@email.ru' }],
			});
		});

		it('search users from email and login second step', async () => {
			const response = await request(app)
				.get('/sa/users?searchEmailTerm=bEmail&searchLoginTerm=blogin')
				.set('authorization', BASIC_AUTH)
				.expect(200);

			expect(response.body).toEqual({
				pagesCount: 1,
				page: 1,
				pageSize: 10,
				totalCount: 2,
				items: [
					{ ...userData, login: 'bLogin', email: 'cemail@email.ru' },
					{ ...userData, login: 'cLogin', email: 'bemail@email.ru' },
				],
			});
		});
	});
});
