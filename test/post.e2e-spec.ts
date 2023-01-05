import { TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { mainTest } from '../src/main-test';
import { blogCreator } from './dbSeeding/blogCreator';
import { userCreator } from './dbSeeding/userCreator';
import { postCreator } from './dbSeeding/postCreator';
import { BASIC_AUTH } from './helpers/constants';
import { Connection } from 'typeorm';
import { getRandomId } from './helpers/getRandomId';
import { clearDb } from './helpers/clearDb';

describe('PostController (e2e)', () => {
	let dataApp: { app: INestApplication; module: TestingModule; connection: Connection };
	let connection: Connection;
	let app: INestApplication;

	const randomId = getRandomId();

	const blogData = {
		id: getRandomId(),
		youtubeUrl: 'https://youtube.com/343344343fvcxv32rfdsvd',
		name: 'name',
		createdAt: expect.any(String),
	};

	const userDataId = getRandomId();
	const userDataIdAlien = getRandomId();
	const userDataLogin = {
		login: 'login',
		email: 'email@email.ru',
		password: '123456',
	};

	const likeNotAuthorizedData = {
		likesCount: 1,
		dislikesCount: 0,
		myStatus: 'None',
		newestLikes: [
			{
				addedAt: expect.any(String),
				userId: expect.any(String),
				login: userDataLogin.login,
			},
		],
	};

	const likeAuthorizedData = {
		likesCount: 1,
		dislikesCount: 0,
		myStatus: 'Like',
		newestLikes: [
			{
				addedAt: expect.any(String),
				userId: expect.any(String),
				login: userDataLogin.login,
			},
		],
	};

	const dislikeNotAuthorizedData = {
		likesCount: 0,
		dislikesCount: 1,
		myStatus: 'None',
		newestLikes: [],
	};

	const dislikeAuthorizedData = {
		likesCount: 0,
		dislikesCount: 1,
		myStatus: 'Dislike',
		newestLikes: [],
	};

	const emptyLikesDislikesData = {
		likesCount: 0,
		dislikesCount: 0,
		myStatus: 'None',
		newestLikes: [],
	};

	const postDataId = getRandomId();
	const postData = {
		id: expect.any(String),
		title: 'title',
		shortDescription: 'shortDescription',
		content: 'content content content content content',
		blogId: blogData.id.toString(),
		blogName: blogData.name,
		createdAt: expect.any(String),
		extendedLikesInfo: {
			dislikesCount: 0,
			likesCount: 0,
			myStatus: 'None',
			newestLikes: [],
		},
	};

	const postErrorsMessages = {
		errorsMessages: [
			{
				field: 'title',
				message: expect.any(String),
			},
			{
				field: 'shortDescription',
				message: expect.any(String),
			},
			{
				field: 'content',
				message: expect.any(String),
			},
			/*{
				field: 'blogId',
				message: expect.any(String),
			},*/
		],
	};

	const likeErrorsMessages = {
		errorsMessages: [
			{
				field: 'likeStatus',
				message: expect.any(String),
			},
		],
	};

	const userErrorsBan = {
		errorsMessages: [
			{
				field: 'isBanned',
				message: expect.any(String),
			},
			{
				field: 'banReason',
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

	describe('add, get, delete new post', () => {
		beforeAll(async () => {
			await clearDb(connection);

			await connection.query(userCreator(userDataLogin.login, userDataLogin.email, 1, userDataId));
			await connection.query(
				blogCreator(blogData.name, 1, blogData.youtubeUrl, blogData.id, userDataId),
			);
		});

		let postId;
		let token;

		it('should return 404 for not existing post (PUBLIC ENDPOINT)', async () => {
			await request(app).get(`/posts/${randomId}`).expect(404);
		});

		it('should return 404 for not existing post (PUBLIC ENDPOINT)', async () => {
			await request(app).get(`/posts/${randomId}/comments`).expect(404);
		});

		it('should return 200 and all posts null (PUBLIC ENDPOINT)', async () => {
			const response = await request(app).get('/posts').expect(200);

			expect(response.body).toEqual({
				pagesCount: 0,
				page: 1,
				pageSize: 10,
				totalCount: 0,
				items: [],
			});
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

		it('add new post (BLOGGER ENDPOINT)', async () => {
			const createdPost = await request(app)
				.post(`/blogger/blogs/${blogData.id}/posts`)
				.set('authorization', `Bearer ${token}`)
				.send({
					title: postData.title,
					shortDescription: postData.shortDescription,
					content: postData.content,
				})
				.expect(201);

			expect(createdPost.body).toEqual(postData);

			postId = createdPost.body.id;
		});

		it('get all posts after add (PUBLIC ENDPOINT)', async () => {
			const allPosts = await request(app).get(`/posts`).expect(200);

			expect(allPosts.body).toEqual({
				pagesCount: 1,
				page: 1,
				pageSize: 10,
				totalCount: 1,
				items: [postData],
			});
		});

		it('find existing post by id after add (PUBLIC ENDPOINT)', async () => {
			const blog = await request(app).get(`/posts/${postId}`).expect(200);
			expect(blog.body).toEqual(postData);
		});

		it('delete post by id (BLOGGER ENDPOINT)', async () => {
			await request(app)
				.delete(`/blogger/blogs/${blogData.id}/posts/${postId}`)
				.set('authorization', `Bearer ${token}`)
				.expect(204);
		});

		it('find not existing post by id after delete (PUBLIC ENDPOINT)', async () => {
			await request(app).get(`/posts/${postId}`).expect(404);
		});

		it('delete a post that does not exist (BLOGGER ENDPOINT)', async () => {
			await request(app)
				.delete(`/blogger/blogs/${blogData.id}/posts/${randomId}`)
				.set('authorization', `Bearer ${token}`)
				.expect(404);
		});
	});

	describe('update post', () => {
		const blogIdNew = getRandomId();

		beforeAll(async () => {
			await clearDb(connection);

			await connection.query(userCreator(userDataLogin.login, userDataLogin.email, 1, userDataId));
			await connection.query(
				blogCreator(blogData.name, 1, blogData.youtubeUrl, blogData.id, userDataId),
			);
			await connection.query(blogCreator('newName', 1, blogData.youtubeUrl, blogIdNew, userDataId));
		});

		let postId;
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

		it('add new post (BLOGGER ENDPOINT)', async () => {
			const createdPost = await request(app)
				.post(`/blogger/blogs/${blogData.id}/posts`)
				.set('authorization', `Bearer ${token}`)
				.send({
					title: postData.title,
					shortDescription: postData.shortDescription,
					content: postData.content,
				})
				.expect(201);

			expect(createdPost.body).toEqual(postData);

			postId = createdPost.body.id;
		});

		it('update post after add (BLOGGER ENDPOINT)', async () => {
			await request(app)
				.put(`/blogger/blogs/${blogData.id}/posts/${postId}`)
				.set('authorization', `Bearer ${token}`)
				.send({
					title: 'new title',
					shortDescription: 'new Short description',
					content: 'new Content',
				})
				.expect(204);
		});

		it('get post after update (PUBLIC ENDPOINT)', async () => {
			const getUpdatedPost = await request(app).get(`/posts/${postId}`).expect(200);

			expect(getUpdatedPost.body).toEqual({
				...postData,
				title: 'new title',
				shortDescription: 'new Short description',
				content: 'new Content',
			});
		});

		it('update a post that does not exist (BLOGGER ENDPOINT)', async () => {
			await request(app)
				.put(`/blogger/blogs/${blogData.id}/posts/${randomId}`)
				.set('authorization', `Bearer ${token}`)
				.send({
					title: 'new title',
					shortDescription: 'new Short description',
					content: 'new Content',
					blogId: blogIdNew,
				})
				.expect(404);
		});
	});

	describe('add, update new post with incorrect body data', () => {
		beforeAll(async () => {
			await clearDb(connection);

			await connection.query(userCreator(userDataLogin.login, userDataLogin.email, 1, userDataId));
			await connection.query(
				blogCreator(blogData.name, 1, blogData.youtubeUrl, blogData.id, userDataId),
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

		it('add a new post with incorrect body data (BLOGGER ENDPOINT)', async () => {
			const addPostError = await request(app)
				.post(`/blogger/blogs/${blogData.id}/posts`)
				.set('authorization', `Bearer ${token}`)
				.expect(400);

			expect(addPostError.body).toEqual(postErrorsMessages);
		});

		it('update post with incorrect body data (BLOGGER ENDPOINT)', async () => {
			const updatePostError = await request(app)
				.put(`/blogger/blogs/${blogData.id}/posts/${randomId}`)
				.set('authorization', `Bearer ${token}`)
				.expect(400);

			expect(updatePostError.body).toEqual(postErrorsMessages);
		});
	});

	describe('add, delete, update blog with not authorized user', () => {
		beforeAll(async () => {
			await clearDb(connection);
		});

		it('add post with not authorized user (BLOGGER ENDPOINT)', async () => {
			await request(app)
				.post(`/blogger/blogs/${blogData.id}/posts`)
				.set('authorization', 'wrongAuth')
				.send(postData)
				.expect(401);
		});

		it('delete post with not authorized user (BLOGGER ENDPOINT)', async () => {
			await request(app)
				.delete(`/blogger/blogs/${blogData.id}/posts/${randomId}`)
				.set('authorization', 'wrongAuth')
				.expect(401);
		});

		it('update post with not authorized user (BLOGGER ENDPOINT)', async () => {
			await request(app)
				.put(`/blogger/blogs/${blogData.id}/posts/${randomId}`)
				.set('authorization', 'wrongAuth')
				.send(postData)
				.expect(401);
		});
	});

	describe('add, delete, update blog with alien user', () => {
		beforeAll(async () => {
			await clearDb(connection);

			await connection.query(userCreator(userDataLogin.login, userDataLogin.email, 1, userDataId));
			await connection.query(
				blogCreator('newName', 1, blogData.youtubeUrl, blogData.id, userDataIdAlien),
			);
			await connection.query(postCreator('aTitle', postData, 1, postDataId));
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

		it('add post with alien user (BLOGGER ENDPOINT)', async () => {
			await request(app)
				.post(`/blogger/blogs/${blogData.id}/posts`)
				.set('authorization', `Bearer ${token}`)
				.send({
					title: postData.title,
					shortDescription: postData.shortDescription,
					content: postData.content,
				})
				.expect(403);
		});

		it('delete post with alien user (BLOGGER ENDPOINT)', async () => {
			await request(app)
				.delete(`/blogger/blogs/${blogData.id}/posts/${postDataId}`)
				.set('authorization', `Bearer ${token}`)
				.expect(403);
		});

		it('update post with alien user (BLOGGER ENDPOINT)', async () => {
			await request(app)
				.put(`/blogger/blogs/${blogData.id}/posts/${postDataId}`)
				.set('authorization', `Bearer ${token}`)
				.send(postData)
				.expect(403);
		});
	});

	describe('test Likes', () => {
		const postId = getRandomId();
		const useId = getRandomId();

		beforeAll(async () => {
			await clearDb(connection);

			await connection.query(userCreator('randomLogin', 'randomEmail@email', 1, useId));
			await connection.query(
				blogCreator(blogData.name, 1, blogData.youtubeUrl, blogData.id, useId),
			);
			await connection.query(postCreator('aTitle', postData, 1, postId));
		});

		let token;
		let userId;

		it('add new user', async () => {
			const user = await request(app)
				.post('/sa/users')
				.set('authorization', BASIC_AUTH)
				.send(userDataLogin)
				.expect(201);

			userId = user.body.id;
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

		it('should return 404 for not existing post', async () => {
			await request(app)
				.put(`/posts/${randomId}/like-status`)
				.set('authorization', `Bearer ${token}`)
				.send({ likeStatus: 'Like' })
				.expect(404);
		});

		it('should return 400 with incorrect likes body data 1', async () => {
			const like = await request(app)
				.put(`/posts/${postId}/like-status`)
				.set('authorization', `Bearer ${token}`)
				.send({ likeStatus: 'Wrong' })
				.expect(400);

			expect(like.body).toEqual(likeErrorsMessages);
		});

		it('should return 400 with incorrect likes body data 2', async () => {
			const like = await request(app)
				.put(`/posts/${postId}/like-status`)
				.set('authorization', `Bearer ${token}`)
				.expect(400);

			expect(like.body).toEqual(likeErrorsMessages);
		});

		it('should return 204 set Like with correct body data and user auth', async () => {
			await request(app)
				.put(`/posts/${postId}/like-status`)
				.set('authorization', `Bearer ${token}`)
				.send({ likeStatus: 'Like' })
				.expect(204);
		});

		it('get all posts after Like with non authorized user', async () => {
			const allPosts = await request(app).get(`/posts`).expect(200);

			expect(allPosts.body.items[0].extendedLikesInfo).toEqual(likeNotAuthorizedData);
		});

		it('get all posts after Like with authorized user', async () => {
			const allPosts = await request(app)
				.get(`/posts`)
				.set('authorization', `Bearer ${token}`)
				.expect(200);

			expect(allPosts.body.items[0].extendedLikesInfo).toEqual(likeAuthorizedData);
		});

		it('get post by id after Like with non authorized user', async () => {
			const allPosts = await request(app).get(`/posts/${postId}`).expect(200);

			expect(allPosts.body.extendedLikesInfo).toEqual(likeNotAuthorizedData);
		});

		it('get post by id after Like with authorized user', async () => {
			const allPosts = await request(app)
				.get(`/posts/${postId}`)
				.set('authorization', `Bearer ${token}`)
				.expect(200);

			expect(allPosts.body.extendedLikesInfo).toEqual(likeAuthorizedData);
		});

		it('get all posts of blog after Like with non authorized user', async () => {
			const allPosts = await request(app).get(`/blogs/${blogData.id}/posts`).expect(200);

			expect(allPosts.body.items[0].extendedLikesInfo).toEqual(likeNotAuthorizedData);
		});

		it('get all posts of blog after Like with authorized user', async () => {
			const allPosts = await request(app)
				.get(`/blogs/${blogData.id}/posts`)
				.set('authorization', `Bearer ${token}`)
				.expect(200);

			expect(allPosts.body.items[0].extendedLikesInfo).toEqual(likeAuthorizedData);
		});

		it('should return 204 set Dislike with correct body data and user auth', async () => {
			await request(app)
				.put(`/posts/${postId}/like-status`)
				.set('authorization', `Bearer ${token}`)
				.send({ likeStatus: 'Dislike' })
				.expect(204);
		});

		it('get all posts after Dislike with non authorized user', async () => {
			const allPosts = await request(app).get(`/posts`).expect(200);

			expect(allPosts.body.items[0].extendedLikesInfo).toEqual(dislikeNotAuthorizedData);
		});

		it('get all posts after Dislike with authorized user', async () => {
			const allPosts = await request(app)
				.get(`/posts`)
				.set('authorization', `Bearer ${token}`)
				.expect(200);

			expect(allPosts.body.items[0].extendedLikesInfo).toEqual(dislikeAuthorizedData);
		});

		it('get all posts of blog after Dislike with non authorized user', async () => {
			const allPosts = await request(app).get(`/blogs/${blogData.id}/posts`).expect(200);

			expect(allPosts.body.items[0].extendedLikesInfo).toEqual(dislikeNotAuthorizedData);
		});

		it('get all posts of blog after Dislike with authorized user', async () => {
			const allPosts = await request(app)
				.get(`/blogs/${blogData.id}/posts`)
				.set('authorization', `Bearer ${token}`)
				.expect(200);

			expect(allPosts.body.items[0].extendedLikesInfo).toEqual(dislikeAuthorizedData);
		});

		it('get post by id after Dislike with non authorized user', async () => {
			const allPosts = await request(app).get(`/posts/${postId}`).expect(200);

			expect(allPosts.body.extendedLikesInfo).toEqual(dislikeNotAuthorizedData);
		});

		it('get post by id after Dislike with authorized user', async () => {
			const allPosts = await request(app)
				.get(`/posts/${postId}`)
				.set('authorization', `Bearer ${token}`)
				.expect(200);

			expect(allPosts.body.extendedLikesInfo).toEqual(dislikeAuthorizedData);
		});

		it('should return 401 with not authorized at users ban', async () => {
			await request(app).put(`/sa/users/${userId}/ban`).expect(401);
		});

		it('should return 400 with incorrect body data from ban user', async () => {
			const usersBan = await request(app)
				.put(`/sa/users/${userId}/ban`)
				.set('authorization', BASIC_AUTH)
				.expect(400);

			expect(usersBan.body).toEqual(userErrorsBan);
		});

		it('should return 404 with user not found', async () => {
			const usersBan = await request(app)
				.put(`/sa/users/${randomId}/ban`)
				.set('authorization', BASIC_AUTH)
				.send({ isBanned: false, banReason: 'wrehjnrgwrg343tergb45ergetrherth' })
				.expect(404);

			expect(usersBan.body).toEqual({
				errorsMessages: [
					{
						message: expect.any(String),
						field: 'userId',
					},
				],
			});
		});

		it('should return 204 with user banned', async () => {
			await request(app)
				.put(`/sa/users/${userId}/ban`)
				.set('authorization', BASIC_AUTH)
				.send({ isBanned: true, banReason: 'wrehjnrgwrg343tergb45ergetrherth' })
				.expect(204);
		});

		it('get all posts after Ban user', async () => {
			const allPosts = await request(app).get(`/posts`).expect(200);

			expect(allPosts.body.items[0].extendedLikesInfo).toEqual(emptyLikesDislikesData);
		});

		it('get all posts of blog after Ban user', async () => {
			const allPosts = await request(app).get(`/blogs/${blogData.id}/posts`).expect(200);

			expect(allPosts.body.items[0].extendedLikesInfo).toEqual(emptyLikesDislikesData);
		});

		it('get post by id after Ban user', async () => {
			const allPosts = await request(app).get(`/posts/${postId}`).expect(200);

			expect(allPosts.body.extendedLikesInfo).toEqual(emptyLikesDislikesData);
		});
	});

	describe('get all posts and sorting', () => {
		const useId = getRandomId();
		beforeAll(async () => {
			await clearDb(connection);

			await connection.query(userCreator('randomLogin', 'randomEmail@email', 1, useId));
			await connection.query(
				blogCreator(blogData.name, 1, blogData.youtubeUrl, blogData.id, useId),
			);

			await connection.query(postCreator('aTitle', postData, 1));
			await connection.query(postCreator('cTitle', postData, 2));
			await connection.query(postCreator('bTitle', postData, 3));
		});

		it('should return 200 and all posts', async () => {
			const response = await request(app).get('/posts').expect(200);

			expect(response.body).toEqual({
				pagesCount: 1,
				page: 1,
				pageSize: 10,
				totalCount: 3,
				items: [
					{ ...postData, title: 'bTitle' },
					{ ...postData, title: 'cTitle' },
					{ ...postData, title: 'aTitle' },
				],
			});
		});

		it('sorting and pages posts', async () => {
			const response = await request(app)
				.get('/posts?sortBy=title&pageSize=2&sortDirection=asc')
				.expect(200);

			expect(response.body).toEqual({
				pagesCount: 2,
				page: 1,
				pageSize: 2,
				totalCount: 3,
				items: [
					{ ...postData, title: 'aTitle' },
					{ ...postData, title: 'bTitle' },
				],
			});
		});
	});

	describe('should return all posts for blog and sorting', () => {
		const blogIdNew = getRandomId();
		const useId = getRandomId();

		beforeAll(async () => {
			await clearDb(connection);
			await connection.query(userCreator('randomLogin', 'randomEmail@email', 1, useId));

			await connection.query(
				blogCreator(blogData.name, 1, blogData.youtubeUrl, blogData.id, useId),
			);
			await connection.query(blogCreator('newName', 1, blogData.youtubeUrl, blogIdNew, useId));

			await connection.query(
				postCreator('aTitle', { ...postData, blogId: blogData.id, blogName: blogData.name }, 1),
			);
			await connection.query(
				postCreator('cTitle', { ...postData, blogId: blogData.id, blogName: blogData.name }, 2),
			);
			await connection.query(
				postCreator('bTitle', { ...postData, blogId: blogData.id, blogName: blogData.name }, 3),
			);
			await connection.query(
				postCreator('dTitle', { ...postData, blogId: blogIdNew, blogName: 'newName' }, 4),
			);
		});

		it('should return all posts for blog', async () => {
			const response = await request(app).get(`/blogs/${blogData.id}/posts`).expect(200);

			expect(response.body).toEqual({
				pagesCount: 1,
				page: 1,
				pageSize: 10,
				totalCount: 3,
				items: [
					{ ...postData, title: 'bTitle' },
					{ ...postData, title: 'cTitle' },
					{ ...postData, title: 'aTitle' },
				],
			});
		});

		it('sorting and pages posts for blog', async () => {
			const response = await request(app)
				.get(`/blogs/${blogData.id}/posts?sortBy=title&pageSize=2&sortDirection=asc`)
				.expect(200);

			expect(response.body).toEqual({
				pagesCount: 2,
				page: 1,
				pageSize: 2,
				totalCount: 3,
				items: [
					{ ...postData, title: 'aTitle' },
					{ ...postData, title: 'bTitle' },
				],
			});
		});
	});
});
