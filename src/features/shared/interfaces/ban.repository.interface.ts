import { MainRepositoryInterface } from './main.repository.interface';

export interface BanRepositoryInterface<MODEL, TYPE> extends MainRepositoryInterface<MODEL, TYPE> {
	setBan(userId: string, isBanned: boolean): Promise<void>;
}
