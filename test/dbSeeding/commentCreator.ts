import add from 'date-fns/add';
import { getRandomId } from '../helpers/getRandomId';

export const commentCreator = (
	content: string,
	userId: number,
	userLogin: string,
	postId: number,
	hours: number,
	id?: number,
) => {
	return `INSERT INTO "Comments"
    ("id", "content", "userId", "postId", "blogId", "isBanned", "createdAt")
  VALUES 
    (${!id ? getRandomId() : id},
     '${content}',
     '${userId}', 
     '${postId}',
     '${getRandomId()}',
     false,
     '${add(new Date(), {
				hours: hours,
			}).toISOString()}')`;
};
