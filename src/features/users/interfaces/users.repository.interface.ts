import { CreateUserExtendsDto } from '../dto';
import { UserModel } from '../domain/user.schema';
import { MainRepositoryInterface } from '../../shared/interfaces/main.repository.interface';

/* eslint-disable */
export interface UsersRepositoryInterface
	extends MainRepositoryInterface<UserModel, CreateUserExtendsDto> {
	findUserByLogin(login: string): Promise<UserModel | null>;
	findUserByEmail(email: string): Promise<UserModel | null>;
	findUserByEmailOrLogin(emailOrLogin: string): Promise<UserModel | null>;
	findUserByConfirmationCode(confirmationCode: string): Promise<UserModel | null>;
	updateConfirmationCode(confirmationCode: string, userId: string): Promise<void>;
	banUnbanUser(isBanned: boolean, banReason: string, banDate: string, userId): Promise<void>;
	updateIsConfirmed(IsConfirmed: boolean, userId: string): Promise<void>
	updatePassword(password: string, userId: string): Promise<void>
}
