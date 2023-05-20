import { Injectable, NestMiddleware, HttpStatus, HttpException } from '@nestjs/common';
import { Response, NextFunction } from 'express';
import * as dotenv from "dotenv";
import { CustomRequest } from "src/custom/request/request.model";
import { MissingFieldsMiddleware } from 'src/custom/custom.middleware';
import mongoose from 'mongoose';
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
export class RemoveUserMiddleware extends MissingFieldsMiddleware implements NestMiddleware {
	constructor() {
		const requiredFields = ['id'];
		super(requiredFields);
		this.requiredFields = requiredFields;
	}

	use(req: CustomRequest, res: Response, next: NextFunction) {
		const role = req.payload.role;
		const id = req.payload.id;

		if (! this.checkMissingFields(req)) {
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
 	}
}