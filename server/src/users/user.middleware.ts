import { Injectable, NestMiddleware } from '@nestjs/common';
import { Response, NextFunction } from 'express';

import * as dotenv from "dotenv";
import { CustomRequest } from "src/custom/request/request.model";
import { MissingFieldsMiddleware } from 'src/custom/custom.middleware';
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