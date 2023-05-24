import { Injectable, NestMiddleware, HttpStatus, HttpException } from '@nestjs/common';
import { Response, NextFunction } from 'express';
import * as dotenv from "dotenv";
import { CustomRequest } from "src/custom/request/request.model";
import { MissingFieldsMiddleware } from 'src/custom/custom.middleware';
import mongoose from 'mongoose';
import { Debug } from 'src/custom/debug/debug';
import { UserModel } from './user.model';
dotenv.config();

@Injectable()
export class RegisterUserMiddleware extends MissingFieldsMiddleware implements NestMiddleware {
	constructor() {
		const requiredFields = [
			'name', 'username', 'email', 'password', 'department'
		];
		super(requiredFields)
	}

	use(req: CustomRequest, res: Response, next: NextFunction) {
		this.checkMissingFields(req);
		return next();
	}
}

@Injectable()
export class LoginUserMiddleware extends MissingFieldsMiddleware implements NestMiddleware {
	constructor() {
		const requiredFields = ['username', 'password']
		super(requiredFields);
	}

	use(req: CustomRequest, res: Response, next: NextFunction) {
		this.checkMissingFields(req);
		return next();
	}
}

@Injectable()
export class RemoveUserMiddleware implements NestMiddleware {
	async use(req: CustomRequest, res: Response, next: NextFunction) {
		const role = req.payload.role;
		const id = req.payload.id;

		if (role === 'admin') {
			return next();
		}

		if (req.body['username']) {
			const user = await this.retrieveUser(id);
			if (req.body['username'] === user.username) {
				return next();
			}
			throw new HttpException("User not authorized", HttpStatus.UNAUTHORIZED);
		}
		return next();
 	}

	private async retrieveUser(userID: string) {
		const user = await UserModel.findById(userID);
		if (! user) {
			throw new HttpException("User not found", HttpStatus.NOT_FOUND);
		}
		return user;
	}
}

@Injectable()
export class UpdateUserMiddleware extends MissingFieldsMiddleware implements NestMiddleware {
	constructor() {
		const requiredFields = ['username'];
		super(requiredFields);
	}

	use(req: CustomRequest, res: Response, next: NextFunction) {
		this.checkMissingFields(req)
		return next();
	}
}

@Injectable()
export class ExtendSubscriptionMiddleware extends MissingFieldsMiddleware implements NestMiddleware {
	constructor() {
		const requiredFields = ['username', 'extension'];
		super(requiredFields);
	}

	use(req: CustomRequest, res: Response, next: NextFunction) {
		this.checkMissingFields(req);
		const reqExtension = req.body['extension']
		if (typeof reqExtension === 'string') {
			if (reqExtension.includes('.')) {
				throw new HttpException(
					"Invalid extension format (Must be positive integer)", 
					HttpStatus.BAD_REQUEST
				)
			}
			const extension = parseInt(reqExtension)
			if (Number.isNaN(extension)) {
				throw new HttpException(
					"Invalid extension format (Must be positive integer)", 
					HttpStatus.BAD_REQUEST
				)
			}
			if (extension <= 0) {
				throw new HttpException(
					"Invalid extension format (Must be positive integer)", 
					HttpStatus.BAD_REQUEST
				)
			}
			return next();
		} else if (typeof reqExtension === 'number') {
			if (Number.isInteger(reqExtension) && reqExtension > 0) {
				return next();
			}
			throw new HttpException(
				"Invalid extension format (Must be positive integer)", 
				HttpStatus.BAD_REQUEST
			)
		} else {
			throw new HttpException(
				"Invalid extension format (Must be positive integer)", 
				HttpStatus.BAD_REQUEST
			)
		}		
	}
}

@Injectable()
export class RetrieveUserMiddleware extends MissingFieldsMiddleware implements NestMiddleware {
	constructor() {
		const requiredFields = ['username']
		super(requiredFields);
	}

	use(req: CustomRequest, res: Response, next: NextFunction) {
		this.checkMissingFields(req)
		return next();
	}
}

@Injectable()
export class RetrieveUsersMiddleware implements NestMiddleware {
	use(req: CustomRequest, res: Response, next: NextFunction) {
		const reqExpireIn = req.query['expireIn']
		if (reqExpireIn) {
			if (typeof reqExpireIn === 'string') {
				if (reqExpireIn.includes('.')) {
					throw new HttpException(
						"Invalid expireIn format (Must be positive integer)", 
						HttpStatus.BAD_REQUEST
					)
				}
				const expireIn = parseInt(reqExpireIn)
				if (Number.isNaN(expireIn)) {
					throw new HttpException(
						"Invalid expireIn format (Must be positive integer)", 
						HttpStatus.BAD_REQUEST
					)
				}
				if (expireIn <= 0) {
					throw new HttpException(
						"Invalid expireIn format (Must be positive integer)", 
						HttpStatus.BAD_REQUEST
					)
				}
				return next();
			} else if (typeof reqExpireIn === 'number') {
				if (Number.isInteger(reqExpireIn) && reqExpireIn > 0) {
					return next();
				}
				throw new HttpException(
					"Invalid expireIn format (Must be positive integer)", 
					HttpStatus.BAD_REQUEST
				)
			} else {
				throw new HttpException(
					"Invalid expireIn format (Must be positive integer)", 
					HttpStatus.BAD_REQUEST
				)
			}
		}
		
		return next();
	}
}