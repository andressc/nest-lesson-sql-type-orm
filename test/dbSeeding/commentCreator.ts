import { ObjectId } from 'mongodb';
import add from 'date-fns/add';

export const commentCreator = (
	content: string,
	userId: string,
	userLogin: string,
	postId: string,
	hours: number,
	id?: string,
) => {
	return {
		_id: !id ? new ObjectId().toString() : id,
		content,
		userId,
		userLogin,
		postId,
		blogUserId: new ObjectId(postId).toString(),
		postTitle: 'postTitle',
		blogId: new ObjectId(postId).toString(),
		blogName: 'blogName',

		createdAt: add(new Date(), {
			hours: hours,
		}),
	};
};
