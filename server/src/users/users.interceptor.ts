import {
	Injectable,
	ExecutionContext,
	NestInterceptor, HttpStatus,
	CallHandler,
	HttpException
} from '@nestjs/common';
import { CustomRequest } from "src/common/request/request.model";
import { User } from './users.model';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';


@Injectable()
export class ModifyUserInterceptor implements NestInterceptor {
	constructor(
		@InjectModel('User') private readonly userModel: Model<User>
	) { }

	async intercept(context: ExecutionContext, next: CallHandler) {
		const req = context.switchToHttp().getRequest<CustomRequest>();
		const { payload } = req;
		const { username } = req.params;

		const userID = payload['id'];
		const role = payload['role'];

		if (role === 'admin') {
			return next.handle();
		}

		const user = await this.retrieveUser(username);
		if (user.id === userID) {
			return next.handle();
		}

		throw new HttpException("User not authorized", HttpStatus.FORBIDDEN);
	}

	private async retrieveUser(username: string) {
		const user = await this.userModel.findOne({ username });
		if (!user) {
			throw new HttpException("User not authorized", HttpStatus.FORBIDDEN);
		}
		return user;
	}
}
