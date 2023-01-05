import { getRandomId } from '../helpers/getRandomId';

export const banCreator = () => {
	return `INSERT INTO "Ban"
    ("id", "userId", "blogId")
  VALUES 
    (${getRandomId()},
     ${getRandomId()},
		 ${getRandomId()})`;
};
