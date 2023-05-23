import { Injectable, NestMiddleware, HttpStatus, HttpException } from '@nestjs/common';
import { Response, NextFunction } from 'express';
import * as dotenv from "dotenv";
import { CustomRequest } from "src/custom/request/request.model";
import { MissingFieldsMiddleware } from 'src/custom/custom.middleware';
import mongoose from 'mongoose';
import { Debug } from 'src/custom/debug/debug';
dotenv.config();

@Injectable()
export class RegisterUserMiddleware extends MissingFieldsMiddleware implements NestMiddleware {
	constructor() {
		const fields = ['name', 'username', 'email', 'password', 'department']
		super(fields)
		this.requiredFields = fields;
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
		this.requiredFields = requiredFields;
	}

	use(req: CustomRequest, res: Response, next: NextFunction) {
		this.checkMissingFields(req);
		return next();
	}
}

@Injectable()
export class RemoveUserMiddleware implements NestMiddleware {
	use(req: CustomRequest, res: Response, next: NextFunction) {
		const role = req.payload.role;
		const id = req.payload.id;

		if (req.body['id']) {
			if (! mongoose.isValidObjectId(req.body['id'])) {
				throw new HttpException("Invalid user ID format", HttpStatus.BAD_REQUEST)
			}

			if (role === 'user') {
				if (id === req.body['id']) {
					return next()
				} 
				throw new HttpException("User not authorized", HttpStatus.FORBIDDEN)
			} else if (role === 'admin') {
				return next();
			}
		}
		return next();
 	}
}

@Injectable()
export class UpdateUserMiddleware extends MissingFieldsMiddleware implements NestMiddleware {
	constructor() {
		const requiredFields = ['id'];
		super(requiredFields);
		this.requiredFields = requiredFields;
	}

	use(req: CustomRequest, res: Response, next: NextFunction) {
		if (! this.checkMissingFields(req)) {
			if (! mongoose.isValidObjectId(req.body['id'])) {
				throw new HttpException("Invalid user ID format", HttpStatus.BAD_REQUEST)
			}
			return next();
		}
	}
}

@Injectable()
export class ExtendSubscriptionMiddleware extends MissingFieldsMiddleware implements NestMiddleware {
	constructor() {
		const requiredFields = ['userID', 'extension'];
		super(requiredFields);
		this.requiredFields = requiredFields;
	}

	use(req: CustomRequest, res: Response, next: NextFunction) {
		if (! this.checkMissingFields(req)) {
			if (! mongoose.isValidObjectId(req.body['userID'])) {
				throw new HttpException('Invalid user ID format', HttpStatus.BAD_REQUEST)
			}

			if (typeof req.body['extension'] === 'string') {
				if (req.body['extension'].includes('.')) {
					throw new HttpException("Invalid extension format (Must be positive integer)", HttpStatus.BAD_REQUEST)
				}
				const extension = parseInt(req.body['extension'])
				if (Number.isNaN(extension)) {
					throw new HttpException("Invalid extension format (Must be positive integer)", HttpStatus.BAD_REQUEST)
				}
				if (extension <= 0) {
					throw new HttpException("Invalid extension format (Must be positive integer)", HttpStatus.BAD_REQUEST)
				}
				return next();
			}
		}
	}
}

@Injectable()
export class RetrieveUserMiddleware extends MissingFieldsMiddleware implements NestMiddleware {
	constructor() {
		const requiredFields = ['id']
		super(requiredFields);
		this.requiredFields = requiredFields;
	}

	use(req: CustomRequest, res: Response, next: NextFunction) {
		if (! this.checkMissingFields(req)) {
			if (! mongoose.isValidObjectId(req.body['id'])) {
				throw new HttpException("Invalid user ID format", HttpStatus.BAD_REQUEST)
			}
			return next();
		}
	}
}

@Injectable()
export class RetrieveAllUsersMiddleware implements NestMiddleware {
	use(req: CustomRequest, res: Response, next: NextFunction) {
		if (req.query['expireIn']) {
			if (typeof req.query['expireIn'] === 'string') {
				if (req.query['expireIn'].includes('.')) {
					throw new HttpException("Invalid extension format (Must be positive integer)", HttpStatus.BAD_REQUEST)
				}
				const expireIn = parseInt(req.query['expireIn'])
				if (Number.isNaN(expireIn)) {
					throw new HttpException("Invalid extension format (Must be positive integer)", HttpStatus.BAD_REQUEST)
				}
				if (expireIn <= 0) {
					throw new HttpException("Invalid extension format (Must be positive integer)", HttpStatus.BAD_REQUEST)
				}
				return next();
			}
		}
		
		return next();
	}
}