import { QueryUserDto, ResponseUserDto, ResponseUserMeDto } from '../dto';
import { PaginationDto } from '../../../common/dto';

export interface QueryUsersRepositoryInterface {
	findAllUsers(query: QueryUserDto): Promise<PaginationDto<ResponseUserDto[]>>;
	findMe(id: string): Promise<ResponseUserMeDto>;
	findUserById(id: string): Promise<ResponseUserDto>;
}
