import add from 'date-fns/add';
import { getRandomId } from '../helpers/getRandomId';

export const postCreator = (title: string, postData, hours: number, id?: number) => {
	return `INSERT INTO "Posts"
    ("id", "title", "shortDescription", "content", "blogId", "isBanned", "createdAt")
  VALUES 
    (${!id ? getRandomId() : id},
     '${title}',
     '${postData.shortDescription}', 
     '${postData.content}',
     '${postData.blogId}',
     false,
     '${add(new Date(), {
				hours: hours,
			}).toISOString()}')`;
};
