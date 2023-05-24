import { Injectable, NestMiddleware, HttpStatus, HttpException } from '@nestjs/common';
import { Response, NextFunction } from 'express';
import * as dotenv from "dotenv";
import { CustomRequest } from "src/custom/request/request.model";
import { MissingFieldsMiddleware } from 'src/custom/custom.middleware';
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
		this.isStrongPassword(req);
		return next();
	}

	private isStrongPassword(req) {
		const password = req.body['password'];
		if (password.length < 8) {
			throw new HttpException("Password does not meet minimum requirements", HttpStatus.BAD_REQUEST);
		}
		return true;
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
		const requiredFields = ['oldUsername'];
		super(requiredFields);
	}

	async use(req: CustomRequest, res: Response, next: NextFunction) {
		this.checkMissingFields(req)

		const userID = req.payload['id'];
		const role = req.payload['role'];

		if (role === 'admin') {
			return next()
		}
		const user = await this.retrieveUser(req.body['oldUsername']);
		if (user.id === userID) {
			return next();
		}
		throw new HttpException("User not authorized", HttpStatus.FORBIDDEN);
	}

	private async retrieveUser(username: string) {
		const user = await UserModel.findOne({ username });
		if (! user) {
			throw new HttpException("User not found", HttpStatus.NOT_FOUND);
		}
		return user;
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
			if (! /^\d+$/.test(reqExtension)) {
				throw new HttpException(
					"Invalid extension format (Must be positive integer)", 
					HttpStatus.BAD_REQUEST
				)
			}
			const extension = parseInt(reqExtension)
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
export class RetrieveUsersMiddleware implements NestMiddleware {
	use(req: CustomRequest, res: Response, next: NextFunction) {
		const reqExpireIn = req.query['expireIn']
		if (reqExpireIn) {
			if (typeof reqExpireIn === 'string') {
				if (! /^\d+$/.test(reqExpireIn)) {
					throw new HttpException(
						"Invalid extension format (Must be positive integer)", 
						HttpStatus.BAD_REQUEST
					)
				}
				const expireIn = parseInt(reqExpireIn)
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