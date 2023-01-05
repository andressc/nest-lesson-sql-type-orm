import add from 'date-fns/add';
import { getRandomId } from '../helpers/getRandomId';

export const blogCreator = (
	name: string,
	hours: number,
	websiteUrl: string,
	id?: number,
	userId?: number,
) => {
	return `INSERT INTO "Blogs"
    ("id", "name", "description", "websiteUrl", "userId", "userLogin", "isBanned", "createdAt")
  VALUES 
    (${!id ? getRandomId() : id},
				'${name}',
		    'description', 
        '${websiteUrl}',
				'${!userId ? getRandomId() : userId}',
		    'userLogin',
        false,
        '${add(new Date(), {
					hours: hours,
				}).toISOString()}')`;
};
