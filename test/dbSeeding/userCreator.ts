import add from 'date-fns/add';
import { getRandomId } from '../helpers/getRandomId';

export const userCreator = (login: string, email, hours: number, id?: number, banned = false) => {
	return `INSERT INTO "Users"
    ("id", "login", "email", "password", "salt", "confirmationCode", "expirationDate", "isConfirmed", "isBanned", "createdAt")
  VALUES 
    (${!id ? getRandomId() : id},
				'${login}',
				'${email}', 
        '$2b$10$oXNwWWUTZ8oBRWpH.87YueahTHSgSnJ1dpQU0kXGezdtcHFXddJmK',
				'$2b$10$oXNwWWUTZ8oBRWpH.87Yue',
				'confirmationCode',
				'${new Date().toISOString()}',
				true,
				${banned},
        '${add(new Date(), {
					hours: hours,
				}).toISOString()}')`;
};
