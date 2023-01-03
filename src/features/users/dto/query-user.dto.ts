import { QueryDto } from '../../../common/dto';

export class QueryUserDto extends QueryDto {
	searchLoginTerm?: string;
	searchEmailTerm?: string;
	banStatus?: string;
}
