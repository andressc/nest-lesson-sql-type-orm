import { Connection } from 'typeorm';

export const clearDb = async (connection: Connection) => {
	await connection.query(`DELETE FROM "Blogs"`);
	await connection.query(`DELETE FROM "Users"`);
	await connection.query(`DELETE FROM "Posts"`);
	await connection.query(`DELETE FROM "Sessions"`);
	await connection.query(`DELETE FROM "Ban"`);
	await connection.query(`DELETE FROM "PostLikes"`);
	await connection.query(`DELETE FROM "Comments"`);
	await connection.query(`DELETE FROM "CommentLikes"`);
};
