import { Connection } from 'typeorm';

export const clearDb = async (connection: Connection) => {
	await connection.query(
		`TRUNCATE "Blogs", "Users", "Posts", "Sessions", "Ban", "PostLikes", "Comments", "CommentLikes" RESTART IDENTITY`,
	);
};
