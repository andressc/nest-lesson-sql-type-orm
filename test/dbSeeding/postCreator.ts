import { ObjectId } from 'mongodb';
import add from 'date-fns/add';

export const postCreator = (title: string, postData, hours: number, id?: string) => {
	return {
		_id: !id ? new ObjectId().toString() : id,
		title,
		shortDescription: postData.shortDescription,
		content: postData.content,
		blogId: postData.blogId,
		blogName: postData.blogName,
		bloguserId: postData.bloguserId ? postData.bloguserId : new ObjectId().toString(),
		createdAt: add(new Date(), {
			hours: hours,
		}),
	};
};
