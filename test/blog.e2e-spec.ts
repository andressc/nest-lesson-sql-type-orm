import { TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { mainTest } from '../src/main-test';
import { blogCreator } from './dbSeeding/blogCreator';
import { BASIC_AUTH } from './helpers/constants';
import { userCreator } from './dbSeeding/userCreator';
import { getRandomId } from './helpers/getRandomId';
import { Connection } from 'typeorm';
import { clearDb } from './helpers/clearDb';

describe('BlogController (e2e)', () => {
	let dataApp: { app: INestApplication; module: TestingModule; connection: Connection };
	let connection: Connection;
	let app: INestApplication;

	const randomId = getRandomId();

	const blogData = {
		id: expect.any(String),
		name: 'name',
		description: 'description',
		websiteUrl: 'https://youtube.com/343344343fvcxv32rfdsvd',
		createdAt: expect.any(String),
	};

	const banInfoFalse = {
		banDate: null,
		isBanned: false,
	};

	const banInfoTrue = {
		banDate: expect.any(String),
		isBanned: true,
	};

	const blogDataSuperAdmin = {
		id: expect.any(String),
		name: 'name',
		description: 'description',
		websiteUrl: 'https://youtube.com/343344343fvcxv32rfdsvd',
		createdAt: expect.any(String),
		banInfo: banInfoTrue,
		blogOwnerInfo: {
			userId: expect.any(String),
			userLogin: expect.any(String),
		},
	};

	const userDataId = getRandomId();
	const userDataLogin = {
		login: 'login',
		email: 'email@email.ru',
		password: '123456',
	};

	const userDataLogin2 = {
		login: 'login2',
		email: 'email@email2.ru',
		password: '123456',
	};

	const blogErrorsMessages = {
		errorsMessages: [
			{
				field: 'name',
				message: expect.any(String),
			},
			{
				field: 'websiteUrl',
				message: expect.any(String),
			},
			{
				field: 'description',
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
		jest.resetModules();
	});

	describe('ban user of blog (BLOGGER ENDPOINT)', () => {
		beforeAll(async () => {
			await clearDb(connection);

			await connection.query(
				userCreator(userDataLogin2.login, userDataLogin2.email, 1, userDataId),
			);
		});

		let blogId;
		let postId;
		let token;
		let token2;

		it('add new user', async () => {
			await request(app)
				.post('/sa/users')
				.set('authorization', BASIC_AUTH)
				.send(userDataLogin)
				.expect(201);
		});

		it('authorization user', async () => {
			const authToken = await request(app)
				.post('/auth/login')
				.set('user-agent', 'test')
				.send({
					loginOrEmail: userDataLogin.email,
					password: userDataLogin.password,
				})
				.expect(200);

			token = authToken.body.accessToken;
		});

		it('add new blog (BLOGGER ENDPOINT)', async () => {
			const blog = await request(app)
				.post('/blogger/blogs')
				.set('authorization', `Bearer ${token}`)
				.send({
					name: blogData.name,
					description: blogData.description,
					websiteUrl: blogData.websiteUrl,
				})
				.expect(201);

			expect(blog.body).toEqual(blogData);

			blogId = blog.body.id;
		});

		it('add new post of blog (BLOGGER ENDPOINT)', async () => {
			const post = await request(app)
				.post(`/blogger/blogs/${blogId}/posts`)
				.set('authorization', `Bearer ${token}`)
				.send({
					title: 'title title title',
					shortDescription: 'shortDescription shortDescription',
					content: 'content content content content content content content content ',
				})
				.expect(201);

			postId = post.body.id;
		});

		it('ban user of blog (BLOGGER ENDPOINT)', async () => {
			await request(app)
				.put(`/blogger/users/${userDataId}/ban`)
				.set('authorization', `Bearer ${token}`)
				.send({
					isBanned: true,
					banReason: 'stringstringstringst',
					blogId: blogId,
				})
				.expect(204);
		});

		it('get banned user of blog (BLOGGER ENDPOINT)', async () => {
			const bannedUsers = await request(app)
				.get(`/blogger/users/blog/${blogId}`)
				.set('authorization', `Bearer ${token}`)
				.expect(200);

			expect(bannedUsers.body).toEqual({
				pagesCount: 1,
				page: 1,
				pageSize: 10,
				totalCount: 1,
				items: [
					{
						id: expect.any(String),
						login: userDataLogin2.login,
						banInfo: {
							isBanned: true,
							banDate: expect.any(String),
							banReason: 'stringstringstringst',
						},
					},
				],
			});
		});

		it('authorization banned user of blog', async () => {
			const authToken = await request(app)
				.post('/auth/login')
				.set('user-agent', 'test')
				.send({
					loginOrEmail: userDataLogin2.email,
					password: userDataLogin2.password,
				})
				.expect(200);

			token2 = authToken.body.accessToken;
		});

		it('send comment from blog after ban (PUBLIC ENDPOINT)', async () => {
			await request(app)
				.post(`/posts/${postId}/comments`)
				.set('authorization', `Bearer ${token2}`)
				.send({
					content: 'stringstringstringst',
				})
				.expect(403);
		});

		/*it('update comment from blog after ban (PUBLIC ENDPOINT)', async () => {
			const response = await request(app)
				.put('/blogger/blogs')
				.set('authorization', `Bearer ${token2}`)
				.expect(403);
		});

		it('delete comment from blog after ban (PUBLIC ENDPOINT)', async () => {
			const response = await request(app)
				.put('/blogger/blogs')
				.set('authorization', `Bearer ${token2}`)
				.expect(403);
		});*/

		it('unBan user of blog (BLOGGER ENDPOINT)', async () => {
			await request(app)
				.put(`/blogger/users/${userDataId}/ban`)
				.set('authorization', `Bearer ${token}`)
				.send({
					isBanned: false,
					banReason: 'stringstringstringst',
					blogId: blogId,
				})
				.expect(204);
		});

		it('send comment from blog after unBan (PUBLIC ENDPOINT)', async () => {
			await request(app)
				.post(`/posts/${postId}/comments`)
				.set('authorization', `Bearer ${token2}`)
				.send({
					content: 'stringstringstringst',
				})
				.expect(201);
		});

		/*it('update comment from blog after unBan (PUBLIC ENDPOINT)', async () => {
			const response = await request(app)
				.put('/blogger/blogs')
				.set('authorization', `Bearer ${token2}`)
				.expect(403);
		});

		it('delete comment from blog after unBan (PUBLIC ENDPOINT)', async () => {
			const response = await request(app)
				.put('/blogger/blogs')
				.set('authorization', `Bearer ${token2}`)
				.expect(403);
		});*/
	});

	describe('ban blog (SUPER ADMIN ENDPOINT)', () => {
		beforeAll(async () => {
			await clearDb(connection);
		});

		let blogId;
		let token;
		let postId;

		it('add new user', async () => {
			await request(app)
				.post('/sa/users')
				.set('authorization', BASIC_AUTH)
				.send(userDataLogin)
				.expect(201);
		});

		it('authorization user', async () => {
			const authToken = await request(app)
				.post('/auth/login')
				.set('user-agent', 'test')
				.send({
					loginOrEmail: userDataLogin.email,
					password: userDataLogin.password,
				})
				.expect(200);

			token = authToken.body.accessToken;
		});

		it('add new blog (BLOGGER ENDPOINT)', async () => {
			const blog = await request(app)
				.post('/blogger/blogs')
				.set('authorization', `Bearer ${token}`)
				.send({
					name: blogData.name,
					description: blogData.description,
					websiteUrl: blogData.websiteUrl,
				})
				.expect(201);

			expect(blog.body).toEqual(blogData);

			blogId = blog.body.id;
		});

		it('add new post (BLOGGER ENDPOINT)', async () => {
			const createdPost = await request(app)
				.post(`/blogger/blogs/${blogId}/posts`)
				.set('authorization', `Bearer ${token}`)
				.send({
					title: 'title',
					shortDescription: 'shortDescription',
					content: 'content content content content content content content',
				})
				.expect(201);

			postId = createdPost.body.id;
		});

		it('ban blog (SUPER ADMIN ENDPOINT)', async () => {
			await request(app)
				.put(`/sa/blogs/${blogId}/ban`)
				.set('authorization', BASIC_AUTH)
				.send({ isBanned: true })
				.expect(204);
		});

		it('get all blogs after ban (BLOGGER ENDPOINT)', async () => {
			const response = await request(app)
				.get('/blogger/blogs')
				.set('authorization', `Bearer ${token}`)
				.expect(200);

			expect(response.body).toEqual({
				pagesCount: 0,
				page: 1,
				pageSize: 10,
				totalCount: 0,
				items: [],
			});
		});

		it('get all blogs after ban (PUBLIC ENDPOINT)', async () => {
			const allBlogs = await request(app).get('/blogs').expect(200);

			expect(allBlogs.body).toEqual({
				pagesCount: 0,
				page: 1,
				pageSize: 10,
				totalCount: 0,
				items: [],
			});
		});

		it('get all posts after ban (PUBLIC ENDPOINT)', async () => {
			const allPosts = await request(app).get('/posts').expect(200);

			expect(allPosts.body).toEqual({
				pagesCount: 0,
				page: 1,
				pageSize: 10,
				totalCount: 0,
				items: [],
			});
		});

		it('get all blogs after ban (SUPER ADMIN ENDPOINT)', async () => {
			const allBlogs = await request(app)
				.get('/sa/blogs')
				.set('authorization', BASIC_AUTH)
				.expect(200);

			expect(allBlogs.body).toEqual({
				pagesCount: 1,
				page: 1,
				pageSize: 10,
				totalCount: 1,
				items: [blogDataSuperAdmin],
			});
		});

		it('find existing blog by id after ban (PUBLIC ENDPOINT)', async () => {
			await request(app).get(`/blogs/${blogId}`).expect(404);
		});

		it('find existing post of blog by id after ban (PUBLIC ENDPOINT)', async () => {
			await request(app).get(`/posts/${postId}`).expect(404);
		});

		it('unBan blog (SUPER ADMIN ENDPOINT)', async () => {
			await request(app)
				.put(`/sa/blogs/${blogId}/ban`)
				.set('authorization', BASIC_AUTH)
				.send({ isBanned: false })
				.expect(204);
		});

		it('get all blogs after unBan (BLOGGER ENDPOINT)', async () => {
			const allBlogs = await request(app)
				.get('/blogger/blogs')
				.set('authorization', `Bearer ${token}`)
				.expect(200);

			expect(allBlogs.body).toEqual({
				pagesCount: 1,
				page: 1,
				pageSize: 10,
				totalCount: 1,
				items: [blogData],
			});
		});

		it('get all blogs after unBan (PUBLIC ENDPOINT)', async () => {
			const allBlogs = await request(app).get('/blogs').expect(200);

			expect(allBlogs.body).toEqual({
				pagesCount: 1,
				page: 1,
				pageSize: 10,
				totalCount: 1,
				items: [blogData],
			});
		});

		it('get all blogs after unBan (SUPER ADMIN ENDPOINT)', async () => {
			const allBlogs = await request(app)
				.get('/sa/blogs')
				.set('authorization', BASIC_AUTH)
				.expect(200);

			expect(allBlogs.body).toEqual({
				pagesCount: 1,
				page: 1,
				pageSize: 10,
				totalCount: 1,
				items: [
					{
						...blogDataSuperAdmin,
						banInfo: banInfoFalse,
					},
				],
			});
		});

		it('find existing blog by id after unBan (PUBLIC ENDPOINT)', async () => {
			const blog = await request(app).get(`/blogs/${blogId}`).expect(200);
			expect(blog.body).toEqual(blogData);
		});

		it('find existing post of blog by id after unBan (PUBLIC ENDPOINT)', async () => {
			await request(app).get(`/posts/${postId}`).expect(200);
		});
	});

	describe('get blog for superAdmin (SUPER ADMIN ENDPOINT)', () => {
		beforeAll(async () => {
			await clearDb(connection);
		});

		it('should return 200 and all blogs null (SUPER ADMIN ENDPOINT)', async () => {
			const response = await request(app)
				.get('/sa/blogs')
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
	});

	describe('get blog (PUBLIC ENDPOINT)', () => {
		beforeAll(async () => {
			await clearDb(connection);
		});

		it('should return 200 and all blogs null (PUBLIC ENDPOINT)', async () => {
			const response = await request(app).get('/blogs').expect(200);

			expect(response.body).toEqual({
				pagesCount: 0,
				page: 1,
				pageSize: 10,
				totalCount: 0,
				items: [],
			});
		});
	});

	describe('add, get, delete new blog', () => {
		beforeAll(async () => {
			await clearDb(connection);

			await connection.query(blogCreator(blogData.name, 1, blogData.websiteUrl));
		});

		let blogId;
		let token;

		it('add new user', async () => {
			await request(app)
				.post('/sa/users')
				.set('authorization', BASIC_AUTH)
				.send(userDataLogin)
				.expect(201);
		});

		it('authorization user', async () => {
			const authToken = await request(app)
				.post('/auth/login')
				.set('user-agent', 'test')
				.send({
					loginOrEmail: userDataLogin.email,
					password: userDataLogin.password,
				})
				.expect(200);

			token = authToken.body.accessToken;
		});

		it('should return 404 for not existing blog (PUBLIC ENDPOINT)', async () => {
			await request(app).get(`/blogs/${randomId}`).expect(404);
		});

		it('should return 200 and all blogs null (BLOGGER ENDPOINT)', async () => {
			const response = await request(app)
				.get('/blogger/blogs')
				.set('authorization', `Bearer ${token}`)
				.expect(200);

			expect(response.body).toEqual({
				pagesCount: 0,
				page: 1,
				pageSize: 10,
				totalCount: 0,
				items: [],
			});
		});

		it('add new blog (BLOGGER ENDPOINT)', async () => {
			const blog = await request(app)
				.post('/blogger/blogs')
				.set('authorization', `Bearer ${token}`)
				.send({
					name: blogData.name,
					description: blogData.description,
					websiteUrl: blogData.websiteUrl,
				})
				.expect(201);

			expect(blog.body).toEqual(blogData);

			blogId = blog.body.id;
		});

		it('get all blogs after add (PUBLIC ENDPOINT)', async () => {
			const allBlogs = await request(app).get('/blogs').expect(200);

			expect(allBlogs.body).toEqual({
				pagesCount: 1,
				page: 1,
				pageSize: 10,
				totalCount: 2,
				items: [blogData, blogData],
			});
		});

		it('get all blogs after add (BLOGGER ENDPOINT)', async () => {
			const allBlogs = await request(app)
				.get('/blogger/blogs')
				.set('authorization', `Bearer ${token}`)
				.expect(200);

			expect(allBlogs.body).toEqual({
				pagesCount: 1,
				page: 1,
				pageSize: 10,
				totalCount: 1,
				items: [blogData],
			});
		});

		it('find existing blog by id after add (PUBLIC ENDPOINT)', async () => {
			const blog = await request(app).get(`/blogs/${blogId}`).expect(200);
			expect(blog.body).toEqual(blogData);
		});

		it('delete blog by id (BLOGGER ENDPOINT)', async () => {
			await request(app)
				.delete(`/blogger/blogs/${blogId}`)
				.set('authorization', `Bearer ${token}`)
				.expect(204);
		});

		it('find not existing blog by id after delete (PUBLIC ENDPOINT)', async () => {
			await request(app).get(`/blogs/${blogId}`).expect(404);
		});

		it('delete a blog that does not exist (BLOGGER ENDPOINT)', async () => {
			await request(app)
				.delete(`/blogger/blogs/${randomId}`)
				.set('authorization', `Bearer ${token}`)
				.expect(404);
		});
	});

	describe('update blog', () => {
		beforeAll(async () => {
			await clearDb(connection);
		});

		let blogId;
		let token;

		it('add new user', async () => {
			await request(app)
				.post('/sa/users')
				.set('authorization', BASIC_AUTH)
				.send(userDataLogin)
				.expect(201);
		});

		it('authorization user', async () => {
			const authToken = await request(app)
				.post('/auth/login')
				.set('user-agent', 'test')
				.send({
					loginOrEmail: userDataLogin.login,
					password: userDataLogin.password,
				})
				.expect(200);

			token = authToken.body.accessToken;
		});

		it('add new blog (BLOGGER ENDPOINT)', async () => {
			const blog = await request(app)
				.post('/blogger/blogs')
				.set('authorization', `Bearer ${token}`)
				.send({
					name: blogData.name,
					description: blogData.description,
					websiteUrl: blogData.websiteUrl,
				})
				.expect(201);

			blogId = blog.body.id;
		});

		it('update blog after add (BLOGGER ENDPOINT)', async () => {
			await request(app)
				.put(`/blogger/blogs/${blogId}`)
				.set('authorization', `Bearer ${token}`)
				.send({
					name: 'newName',
					description: 'newDescription',
					websiteUrl: 'https://www.youtube.com/channel/aaaaaaaaaaaaaaaaaaaa',
				})
				.expect(204);
		});

		it('get blog after update (PUBLIC ENDPOINT)', async () => {
			const blog = await request(app).get(`/blogs/${blogId}`).expect(200);

			expect(blog.body).toEqual({
				...blogData,
				name: 'newName',
				description: 'newDescription',
				websiteUrl: 'https://www.youtube.com/channel/aaaaaaaaaaaaaaaaaaaa',
			});
		});

		it('update a blog that does not exist (BLOGGER ENDPOINT)', async () => {
			await request(app)
				.put(`/blogger/blogs/${randomId}`)
				.set('authorization', `Bearer ${token}`)
				.send({
					name: blogData.name,
					description: blogData.description,
					websiteUrl: blogData.websiteUrl,
				})
				.expect(404);
		});
	});

	describe('add, update new blog with incorrect body data', () => {
		beforeAll(async () => {
			await clearDb(connection);
		});

		let token;

		it('add new user', async () => {
			await request(app)
				.post('/sa/users')
				.set('authorization', BASIC_AUTH)
				.send(userDataLogin)
				.expect(201);
		});

		it('authorization user', async () => {
			const authToken = await request(app)
				.post('/auth/login')
				.set('user-agent', 'test')
				.send({
					loginOrEmail: userDataLogin.login,
					password: userDataLogin.password,
				})
				.expect(200);

			token = authToken.body.accessToken;
		});

		it('add a new blog with incorrect body data (BLOGGER ENDPOINT)', async () => {
			const blogError = await request(app)
				.post('/blogger/blogs')
				.set('authorization', `Bearer ${token}`)
				.send({
					websiteUrl: 'invalid-url',
				})
				.expect(400);

			expect(blogError.body).toEqual(blogErrorsMessages);
		});

		it('update blog with incorrect body data (BLOGGER ENDPOINT)', async () => {
			const blogError = await request(app)
				.put(`/blogger/blogs/${randomId}`)
				.set('authorization', `Bearer ${token}`)
				.send({
					websiteUrl: 'invalid-url',
				})
				.expect(400);

			expect(blogError.body).toEqual(blogErrorsMessages);
		});
	});

	describe('add, delete, update, ban blog with not authorized user', () => {
		beforeAll(async () => {
			await clearDb(connection);
		});

		it('should return 401 get all blogs with not authorized user (BLOGGER ENDPOINT)', async () => {
			await request(app).get('/blogger/blogs').set('authorization', `Wrong Auth`).expect(401);
		});

		it('add blog with not authorized user (BLOGGER ENDPOINT)', async () => {
			await request(app)
				.post('/blogger/blogs')
				.set('authorization', 'wrongAuth')
				.send(blogData)
				.expect(401);
		});

		it('delete blog with not authorized user (BLOGGER ENDPOINT)', async () => {
			await request(app)
				.delete(`/blogger/blogs/${randomId}`)
				.set('authorization', 'wrongAuth')
				.expect(401);
		});

		it('update blog with not authorized user (BLOGGER ENDPOINT)', async () => {
			await request(app)
				.put(`/blogger/blogs/${randomId}`)
				.set('authorization', 'wrongAuth')
				.send(blogData)
				.expect(401);
		});

		it('ban blog with not authorized user (SUPER ADMIN ENDPOINT)', async () => {
			await request(app)
				.put(`/sa/blogs/${randomId}/ban`)
				.set('authorization', 'wrongAuth')
				.send({ isBanned: true })
				.expect(401);
		});

		it('ban blog with user for not authorized user (BLOGGER ENDPOINT)', async () => {
			await request(app)
				.put(`/blogger/users/${randomId}/ban`)
				.set('authorization', 'wrongAuth')
				.send({ isBanned: true })
				.expect(401);
		});

		it('get all banned user from blog for not authorized user (BLOGGER ENDPOINT)', async () => {
			await request(app)
				.get(`/blogger/users/blog/${randomId}`)
				.set('authorization', 'wrongAuth')
				.expect(401);
		});
	});

	describe('delete, update blog with alien user', () => {
		const blogId = getRandomId();
		beforeAll(async () => {
			await clearDb(connection);

			await connection.query(blogCreator(blogData.name, 1, blogData.websiteUrl, blogId));
		});
		let token;

		it('add new user', async () => {
			await request(app)
				.post('/sa/users')
				.set('authorization', BASIC_AUTH)
				.send(userDataLogin)
				.expect(201);
		});

		it('authorization user', async () => {
			const authToken = await request(app)
				.post('/auth/login')
				.set('user-agent', 'test')
				.send({
					loginOrEmail: userDataLogin.login,
					password: userDataLogin.password,
				})
				.expect(200);

			token = authToken.body.accessToken;
		});

		it('delete blog with alien user (BLOGGER ENDPOINT)', async () => {
			await request(app)
				.delete(`/blogger/blogs/${blogId}`)
				.set('authorization', `Bearer ${token}`)
				.expect(403);
		});

		it('update blog with alien user (BLOGGER ENDPOINT)', async () => {
			await request(app)
				.put(`/blogger/blogs/${blogId}`)
				.set('authorization', `Bearer ${token}`)
				.send({
					name: blogData.name,
					description: blogData.description,
					websiteUrl: blogData.websiteUrl,
				})
				.expect(403);
		});
	});

	describe('get all blogs and sorting (PUBLIC ENDPOINT)', () => {
		beforeAll(async () => {
			await clearDb(connection);

			await connection.query(blogCreator('aName', 1, blogData.websiteUrl));
			await connection.query(blogCreator('cName', 2, blogData.websiteUrl));
			await connection.query(blogCreator('bName', 3, blogData.websiteUrl));
		});

		it('should return 200 and all blogs (PUBLIC ENDPOINT)', async () => {
			const response = await request(app).get('/blogs').expect(200);

			expect(response.body).toEqual({
				pagesCount: 1,
				page: 1,
				pageSize: 10,
				totalCount: 3,
				items: [
					{ ...blogData, name: 'bName' },
					{ ...blogData, name: 'cName' },
					{ ...blogData, name: 'aName' },
				],
			});
		});

		it('sorting and pages blogs (PUBLIC ENDPOINT)', async () => {
			const response = await request(app)
				.get('/blogs?sortBy=name&pageSize=2&sortDirection=asc')
				.expect(200);

			expect(response.body).toEqual({
				pagesCount: 2,
				page: 1,
				pageSize: 2,
				totalCount: 3,
				items: [
					{ ...blogData, name: 'aName' },
					{ ...blogData, name: 'bName' },
				],
			});
		});
	});

	describe('get all blogs and sorting (BLOGGER ENDPOINT)', () => {
		beforeAll(async () => {
			await clearDb(connection);

			await connection.query(userCreator(userDataLogin.login, userDataLogin.email, 1, userDataId));
			await connection.query(
				blogCreator('aName', 1, blogData.websiteUrl, getRandomId(), userDataId),
			);
			await connection.query(
				blogCreator('cName', 2, blogData.websiteUrl, getRandomId(), userDataId),
			);
			await connection.query(
				blogCreator('bName', 3, blogData.websiteUrl, getRandomId(), userDataId),
			);
		});

		let token;

		it('authorization user', async () => {
			const authToken = await request(app)
				.post('/auth/login')
				.set('user-agent', 'test')
				.send({
					loginOrEmail: userDataLogin.login,
					password: userDataLogin.password,
				})
				.expect(200);

			token = authToken.body.accessToken;
		});

		it('should return 200 and all blogs (BLOGGER ENDPOINT)', async () => {
			const response = await request(app)
				.get('/blogger/blogs')
				.set('authorization', `Bearer ${token}`)
				.expect(200);

			expect(response.body).toEqual({
				pagesCount: 1,
				page: 1,
				pageSize: 10,
				totalCount: 3,
				items: [
					{ ...blogData, name: 'bName' },
					{ ...blogData, name: 'cName' },
					{ ...blogData, name: 'aName' },
				],
			});
		});

		it('sorting and pages blogs (BLOGGER ENDPOINT)', async () => {
			const response = await request(app)
				.get('/blogger/blogs?sortBy=name&pageSize=2&sortDirection=asc')
				.set('authorization', `Bearer ${token}`)
				.expect(200);

			expect(response.body).toEqual({
				pagesCount: 2,
				page: 1,
				pageSize: 2,
				totalCount: 3,
				items: [
					{ ...blogData, name: 'aName' },
					{ ...blogData, name: 'bName' },
				],
			});
		});
	});

	describe('get all blogs and sorting (SUPER ADMIN ENDPOINT)', () => {
		beforeAll(async () => {
			await clearDb(connection);

			await connection.query(userCreator(userDataLogin.login, userDataLogin.email, 1, userDataId));
			await connection.query(
				blogCreator('aName', 1, blogData.websiteUrl, getRandomId(), userDataId),
			);
			await connection.query(
				blogCreator('cName', 2, blogData.websiteUrl, getRandomId(), userDataId),
			);
			await connection.query(
				blogCreator('bName', 3, blogData.websiteUrl, getRandomId(), userDataId),
			);
		});

		it('should return 200 and all blogs (SUPER ADMIN ENDPOINT)', async () => {
			const response = await request(app)
				.get('/sa/blogs')
				.set('authorization', BASIC_AUTH)
				.expect(200);

			expect(response.body).toEqual({
				pagesCount: 1,
				page: 1,
				pageSize: 10,
				totalCount: 3,
				items: [
					{ ...blogDataSuperAdmin, banInfo: banInfoFalse, name: 'bName' },
					{ ...blogDataSuperAdmin, banInfo: banInfoFalse, name: 'cName' },
					{ ...blogDataSuperAdmin, banInfo: banInfoFalse, name: 'aName' },
				],
			});
		});

		it('sorting and pages blogs (SUPER ADMIN ENDPOINT)', async () => {
			const response = await request(app)
				.get('/sa/blogs?sortBy=name&pageSize=2&sortDirection=asc')
				.set('authorization', BASIC_AUTH)
				.expect(200);

			expect(response.body).toEqual({
				pagesCount: 2,
				page: 1,
				pageSize: 2,
				totalCount: 3,
				items: [
					{ ...blogDataSuperAdmin, banInfo: banInfoFalse, name: 'aName' },
					{ ...blogDataSuperAdmin, banInfo: banInfoFalse, name: 'bName' },
				],
			});
		});
	});

	/*describe('get all banned users from blog and sorting (BLOGGER ENDPOINT)', () => {
		beforeAll(async () => {
			await clearDb(connection);

			await connection.query(userCreator(userDataLogin.login, userDataLogin.email, 1, userDataId));
			await connection.query(blogCreator('aName', 1, blogData.websiteUrl, getRandomId(), userDataId));
			await connection.query(blogCreator('cName', 2, blogData.websiteUrl, getRandomId(), userDataId));
			await connection.query(blogCreator('bName', 3, blogData.websiteUrl, getRandomId(), userDataId));
		});

		it('should return 200 and all blogs (SUPER ADMIN ENDPOINT)', async () => {
			const response = await request(app)
				.get('/sa/blogger/blogs')
				.set('authorization', BASIC_AUTH)
				.expect(200);

			expect(response.body).toEqual({
				pagesCount: 1,
				page: 1,
				pageSize: 10,
				totalCount: 3,
				items: [
					{ ...blogData, name: 'bName' },
					{ ...blogData, name: 'cName' },
					{ ...blogData, name: 'aName' },
				],
			});
		});

		it('sorting and pages blogs (SUPER ADMIN ENDPOINT)', async () => {
			const response = await request(app)
				.get('/sa/blogger/blogs?sortBy=name&pageSize=2&sortDirection=asc')
				.set('authorization', BASIC_AUTH)
				.expect(200);

			expect(response.body).toEqual({
				pagesCount: 2,
				page: 1,
				pageSize: 2,
				totalCount: 3,
				items: [
					{ ...blogData, name: 'aName' },
					{ ...blogData, name: 'bName' },
				],
			});
		});
	});*/
});
