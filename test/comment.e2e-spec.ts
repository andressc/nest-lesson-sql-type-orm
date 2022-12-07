import { TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { Connection, Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { mainTest } from '../src/main-test';
import { ObjectId } from 'mongodb';
import { blogCreator } from './dbSeeding/blogCreator';
import { postCreator } from './dbSeeding/postCreator';
import { commentCreator } from './dbSeeding/commentCreator';
import { stopMongoMemoryServer } from '../src/common/utils';
import { BASIC_AUTH } from './constants';
import { Blog } from '../src/features/blogs/domain/blog.schema';
import { Post } from '../src/features/posts/domain/post.schema';
import { Comment } from '../src/features/comments/domain/comment.schema';
import { userCreator } from './dbSeeding/userCreator';
import { User } from '../src/features/users/domain/user.schema';

describe('CommentController (e2e)', () => {
	let dataApp: { app: INestApplication; module: TestingModule; connection: Connection };
	let BlogModel: Model<Blog>;
	let PostModel: Model<Post>;
	let UserModel: Model<User>;
	let CommentModel: Model<Comment>;
	let connection: Connection;
	let app: INestApplication;
	let module: TestingModule;

	const randomId = new ObjectId().toString();

	const blogData = {
		id: new ObjectId().toString(),
		websiteUrl: 'https://youtube.com/343344343fvcxv32rfdsvd',
		name: 'name',
		createdAt: expect.any(String),
	};

	const userDataLogin = {
		login: 'login',
		email: 'email@email.ru',
		password: '123456',
	};

	const userData = {
		id: new ObjectId().toString(),
		login: 'login',
		email: 'email@email.ru',
		password: '123456',
	};

	const commentData = {
		id: expect.any(String),
		content: 'content content content content content content content content',
		userId: userData.id,
		userLogin: userData.login,
		createdAt: expect.any(String),
		likesInfo: {
			dislikesCount: 0,
			likesCount: 0,
			myStatus: 'None',
		},
	};

	const likeNotAuthorizedData = {
		likesCount: 1,
		dislikesCount: 0,
		myStatus: 'None',
	};

	const likeAuthorizedData = {
		likesCount: 1,
		dislikesCount: 0,
		myStatus: 'Like',
	};

	const dislikeNotAuthorizedData = {
		likesCount: 0,
		dislikesCount: 1,
		myStatus: 'None',
	};

	const dislikeAuthorizedData = {
		likesCount: 0,
		dislikesCount: 1,
		myStatus: 'Dislike',
	};

	/*const emptyLikesDislikesData = {
		likesCount: 0,
		dislikesCount: 0,
		myStatus: 'None',
	};*/

	const emptyData = { pagesCount: 0, page: 1, pageSize: 10, totalCount: 0, items: [] };

	const postData = {
		id: new ObjectId().toString(),
		title: 'title',
		shortDescription: 'shortDescription',
		content: 'content content content content content',
		blogId: blogData.id,
		blogName: blogData.name,
		bloguserId: new ObjectId().toString(),
		createdAt: expect.any(String),
		extendedLikesInfo: {
			dislikesCount: 0,
			likesCount: 0,
			myStatus: 'None',
			newestLikes: [],
		},
	};

	const commentsErrorsMessages = {
		errorsMessages: [
			{
				field: 'content',
				message: expect.any(String),
			},
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

	/*const userErrorsBan = {
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
	};*/

	beforeAll(async () => {
		dataApp = await mainTest();

		connection = dataApp.connection;
		app = dataApp.app.getHttpServer();
		module = dataApp.module;

		BlogModel = module.get<Model<Blog>>(getModelToken(Blog.name));
		PostModel = module.get<Model<Post>>(getModelToken(Post.name));
		CommentModel = module.get<Model<Comment>>(getModelToken(Comment.name));
		UserModel = module.get<Model<User>>(getModelToken(User.name));
	});

	afterAll(async () => {
		await stopMongoMemoryServer();
		await dataApp.app.close();
	});

	describe('add, get, delete, update new comment', () => {
		beforeAll(async () => {
			await connection.db.dropDatabase();

			await BlogModel.create(blogCreator(blogData.name, 1, blogData.websiteUrl, blogData.id));
			await PostModel.create(postCreator('aTitle', postData, 1, postData.id));
		});

		let token;
		let commentId;
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

		it('should return 404 for not existing comment', async () => {
			await request(app).get(`/comments/${randomId}`).expect(404);
		});

		it('should return 200 and all comment null', async () => {
			const response = await request(app).get(`/posts/${postData.id}/comments`).expect(200);

			expect(response.body).toEqual(emptyData);
		});

		it('add new comment', async () => {
			const createdComment = await request(app)
				.post(`/posts/${postData.id}/comments`)
				.set('authorization', `Bearer ${token}`)
				.send({
					content: commentData.content,
				})
				.expect(201);

			expect(createdComment.body).toEqual({ ...commentData, userId });

			commentId = createdComment.body.id;
		});

		it('find existing comment by id after add', async () => {
			const comment = await request(app).get(`/comments/${commentId}`).expect(200);
			expect(comment.body).toEqual({ ...commentData, userId });
		});

		it('update comment after add', async () => {
			await request(app)
				.put(`/comments/${commentId}`)
				.set('authorization', `Bearer ${token}`)
				.send({
					content: 'new content new content new content new content new content',
				})
				.expect(204);
		});

		it('get comment after update', async () => {
			const getUpdatedComment = await request(app).get(`/comments/${commentId}`).expect(200);

			expect(getUpdatedComment.body).toEqual({
				...commentData,
				userId,
				content: 'new content new content new content new content new content',
			});
		});

		it('should return 204 with user banned', async () => {
			await request(app)
				.put(`/sa/users/${userId}/ban`)
				.set('authorization', BASIC_AUTH)
				.send({ isBanned: true, banReason: 'wrehjnrgwrg343tergb45ergetrherth' })
				.expect(204);
		});

		it('get comment after banned should return 404', async () => {
			await request(app).get(`/comments/${commentId}`).expect(404);
		});

		/*it('should return 204 with user un banned', async () => {
			await request(app)
				.put(`/sa/users/${userId}/ban`)
				.set('authorization', BASIC_AUTH)
				.send({ isBanned: false, banReason: 'wrehjnrgwrg343tergb45ergetrherth' })
				.expect(204);
		});*/

		it('delete comment by id', async () => {
			await request(app)
				.delete(`/comments/${commentId}`)
				.set('authorization', `Bearer ${token}`)
				.expect(204);
		});

		it('find not existing comment by id after delete', async () => {
			await request(app).get(`/comments/${commentId}`).expect(404);
		});

		it('delete a comment that does not exist', async () => {
			await request(app)
				.delete(`/comments/${randomId}`)
				.set('authorization', `Bearer ${token}`)
				.expect(404);
		});

		it('update a comment that does not exist', async () => {
			await request(app)
				.put(`/comments/${randomId}`)
				.set('authorization', `Bearer ${token}`)
				.send({
					content: commentData.content,
				})
				.expect(404);
		});
	});

	describe('edit, delete alien comment must be forbidden', () => {
		const alienuserId = new ObjectId().toString();
		const aliencommentId = new ObjectId().toString();
		beforeAll(async () => {
			await connection.dropDatabase();

			await CommentModel.create(
				commentCreator('Content', alienuserId, 'alienUserLogin', postData.id, 1, aliencommentId),
			);
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

		it('edit alien comment must be forbidden', async () => {
			await request(app)
				.put(`/comments/${aliencommentId}`)
				.set('authorization', `Bearer ${token}`)
				.send({
					content: 'content content content content content content content content',
				})
				.expect(403);
		});

		it('delete alien comment must be forbidden', async () => {
			await request(app)
				.delete(`/comments/${aliencommentId}`)
				.set('authorization', `Bearer ${token}`)
				.expect(403);
		});
	});

	describe('add, update new comment wrong body data', () => {
		beforeAll(async () => {
			await connection.dropDatabase();

			await BlogModel.create(blogCreator(blogData.name, 1, blogData.websiteUrl, blogData.id));
			await PostModel.create(postCreator('aTitle', postData, 1, postData.id));
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

		it('add a new comment with incorrect body data', async () => {
			const addCommentError = await request(app)
				.post(`/posts/${postData.id}/comments`)
				.set('authorization', `Bearer ${token}`)
				.expect(400);

			expect(addCommentError.body).toEqual(commentsErrorsMessages);
		});

		it('update comment with incorrect body data', async () => {
			const updateCommentError = await request(app)
				.put(`/comments/${randomId}`)
				.set('authorization', `Bearer ${token}`)
				.expect(400);

			expect(updateCommentError.body).toEqual(commentsErrorsMessages);
		});
	});

	describe('add, delete, update comment with not authorized user', () => {
		beforeAll(async () => {
			await connection.dropDatabase();
		});

		it('add comment with not authorized user', async () => {
			await request(app)
				.post(`/posts/${randomId}/comments`)
				.set('authorization', 'wrongAuth')
				.send({
					content: commentData.content,
				})
				.expect(401);
		});

		it('delete comment with not authorized user', async () => {
			await request(app)
				.delete(`/comments/${randomId}`)
				.set('authorization', 'wrongAuth')
				.expect(401);
		});

		it('update comment with not authorized user', async () => {
			await request(app)
				.put(`/comments/${randomId}`)
				.set('authorization', 'wrongAuth')
				.send({ content: commentData.content })
				.expect(401);
		});
	});

	describe('test Likes', () => {
		//const commentId = new ObjectId().toString();

		beforeAll(async () => {
			await connection.dropDatabase();
			await BlogModel.create(blogCreator(blogData.name, 1, blogData.websiteUrl, blogData.id));
			await PostModel.create(postCreator('aTitle', postData, 1, postData.id));

			/*await CommentModel.create(
				commentCreator(
					'aContent',
					commentData.userId,
					commentData.userLogin,
					postData.id,
					1,
					commentId,
				),
			);*/
		});

		let token;
		let userId;
		let commentId;

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

		it('should return 404 for not existing comment', async () => {
			await request(app)
				.put(`/comments/${randomId}/like-status`)
				.set('authorization', `Bearer ${token}`)
				.send({ likeStatus: 'Like' })
				.expect(404);
		});

		it('should return 400 with incorrect likes body data 1', async () => {
			const like = await request(app)
				.put(`/comments/${commentId}/like-status`)
				.set('authorization', `Bearer ${token}`)
				.send({ likeStatus: 'Wrong' })
				.expect(400);

			expect(like.body).toEqual(likeErrorsMessages);
		});

		it('should return 400 with incorrect likes body data 2', async () => {
			const like = await request(app)
				.put(`/comments/${commentId}/like-status`)
				.set('authorization', `Bearer ${token}`)
				.expect(400);

			expect(like.body).toEqual(likeErrorsMessages);
		});

		it('add new comment', async () => {
			const createdComment = await request(app)
				.post(`/posts/${postData.id}/comments`)
				.set('authorization', `Bearer ${token}`)
				.send({
					content: commentData.content,
				})
				.expect(201);

			expect(createdComment.body).toEqual({ ...commentData, userId });

			commentId = createdComment.body.id;
		});

		it('should return 204 set Like with correct body data and user auth', async () => {
			await request(app)
				.put(`/comments/${commentId}/like-status`)
				.set('authorization', `Bearer ${token}`)
				.send({ likeStatus: 'Like' })
				.expect(204);
		});

		it('get all comments of post after Like with non authorized user', async () => {
			const allComments = await request(app).get(`/posts/${postData.id}/comments`).expect(200);

			expect(allComments.body.items[0].likesInfo).toEqual(likeNotAuthorizedData);
		});

		it('get all comments after Like with authorized user', async () => {
			const allComments = await request(app)
				.get(`/posts/${postData.id}/comments`)
				.set('authorization', `Bearer ${token}`)
				.expect(200);

			expect(allComments.body.items[0].likesInfo).toEqual(likeAuthorizedData);
		});

		it('get comment by id after Like with non authorized user', async () => {
			const allComments = await request(app).get(`/comments/${commentId}`).expect(200);

			expect(allComments.body.likesInfo).toEqual(likeNotAuthorizedData);
		});

		it('get comment by id after Like with authorized user', async () => {
			const allComments = await request(app)
				.get(`/comments/${commentId}`)
				.set('authorization', `Bearer ${token}`)
				.expect(200);

			expect(allComments.body.likesInfo).toEqual(likeAuthorizedData);
		});

		it('should return 204 set Dislike with correct body data and user auth', async () => {
			await request(app)
				.put(`/comments/${commentId}/like-status`)
				.set('authorization', `Bearer ${token}`)
				.send({ likeStatus: 'Dislike' })
				.expect(204);
		});

		it('get all comments of post after Dislike with non authorized user', async () => {
			const allComments = await request(app).get(`/posts/${postData.id}/comments`).expect(200);

			expect(allComments.body.items[0].likesInfo).toEqual(dislikeNotAuthorizedData);
		});

		it('get all comments of post after Dislike with authorized user', async () => {
			const allComments = await request(app)
				.get(`/posts/${postData.id}/comments`)
				.set('authorization', `Bearer ${token}`)
				.expect(200);

			expect(allComments.body.items[0].likesInfo).toEqual(dislikeAuthorizedData);
		});

		it('get comment by id after Dislike with non authorized user', async () => {
			const allComments = await request(app).get(`/comments/${commentId}`).expect(200);

			expect(allComments.body.likesInfo).toEqual(dislikeNotAuthorizedData);
		});

		it('get comment by id after Dislike with authorized user', async () => {
			const allComments = await request(app)
				.get(`/comments/${commentId}`)
				.set('authorization', `Bearer ${token}`)
				.expect(200);

			expect(allComments.body.likesInfo).toEqual(dislikeAuthorizedData);
		});

		it('should return 204 with user banned', async () => {
			await request(app)
				.put(`/sa/users/${userId}/ban`)
				.set('authorization', BASIC_AUTH)
				.send({ isBanned: true, banReason: 'wrehjnrgwrg343tergb45ergetrherth' })
				.expect(204);
		});

		it('get all comments of post after Ban user', async () => {
			const allComments = await request(app).get(`/posts/${postData.id}/comments`).expect(200);
			expect(allComments.body).toEqual(emptyData);
		});

		it('should return 404 get comment by id after Ban user', async () => {
			await request(app).get(`/comments/${commentId}`).expect(404);
		});
	});

	/*describe('test email not confirmed', () => {
		beforeAll(async () => {
			await connection.dropDatabase();
		});

		it('test email not confirmed', async () => {
			const createdPost = await request(app)
				.post(`/blogs/${blogData.id}/posts`)
				.set('authorization', BASIC_AUTH)
				.send({
					title: postData.title,
					shortDescription: postData.shortDescription,
					content: postData.content,
				})
				.expect(201);

			expect(createdPost.body).toEqual(postData);
		});
	});*/

	describe('get all comments of post and sorting', () => {
		beforeAll(async () => {
			await connection.dropDatabase();

			await UserModel.create(userCreator(userData.login, userData.email, 1, commentData.userId));
			await BlogModel.create(blogCreator(blogData.name, 1, blogData.websiteUrl, blogData.id));
			await PostModel.create(postCreator('aTitle', postData, 1, postData.id));

			await CommentModel.insertMany([
				commentCreator('aContent', commentData.userId, commentData.userLogin, postData.id, 1),
				commentCreator('cContent', commentData.userId, commentData.userLogin, postData.id, 2),
				commentCreator('bContent', commentData.userId, commentData.userLogin, postData.id, 3),
			]);
		});

		it('should return 200 and all comments', async () => {
			const response = await request(app).get(`/posts/${postData.id}/comments`).expect(200);

			expect(response.body).toEqual({
				pagesCount: 1,
				page: 1,
				pageSize: 10,
				totalCount: 3,
				items: [
					{ ...commentData, content: 'bContent' },
					{ ...commentData, content: 'cContent' },
					{ ...commentData, content: 'aContent' },
				],
			});
		});

		it('sorting and pages comments', async () => {
			const response = await request(app)
				.get(`/posts/${postData.id}/comments?sortBy=content&pageSize=2&sortDirection=asc`)
				.expect(200);

			expect(response.body).toEqual({
				pagesCount: 2,
				page: 1,
				pageSize: 2,
				totalCount: 3,
				items: [
					{ ...commentData, content: 'aContent' },
					{ ...commentData, content: 'bContent' },
				],
			});
		});

		it('should return 204 with user banned', async () => {
			await request(app)
				.put(`/sa/users/${commentData.userId}/ban`)
				.set('authorization', BASIC_AUTH)
				.send({ isBanned: true, banReason: 'wrehjnrgwrg343tergb45ergetrherth' })
				.expect(204);
		});

		it('get all comments after banned should return 404', async () => {
			const response = await request(app).get(`/posts/${postData.id}/comments`).expect(200);
			expect(response.body).toEqual(emptyData);
		});
	});
});
