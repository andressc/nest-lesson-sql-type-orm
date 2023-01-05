import { getRandomId } from '../helpers/getRandomId';

export const sessionCreator = () => {
	return `INSERT INTO "Sessions"
    ("id", "ip", "title", "lastActiveDate", "expirationDate", "deviceId", "userId")
  VALUES 
    (${getRandomId()},
     'ip',
		 'title',
		 'lastActiveDate',
		 'expirationDate',
		 'deviceId',
     ${getRandomId()})`;
};
