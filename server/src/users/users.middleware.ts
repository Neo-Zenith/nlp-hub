import { 
	Injectable, 
	NestMiddleware, 
	HttpStatus, 
	HttpException 
} from '@nestjs/common';
import { Response, NextFunction } from 'express';
import * as dotenv from "dotenv";
import { CustomRequest } from "src/common/request/request.model";
import { MissingFieldsMiddleware } from 'src/common/common.middleware';
dotenv.config();

@Injectable()
export class RegisterUserMiddleware extends MissingFieldsMiddleware implements NestMiddleware {
	constructor() {
		const requiredFields = [
			'name', 'username', 'email', 'password', 'department'
		];
		const fieldsType = ['string', 'string', 'string', 'string', 'string']
		super(requiredFields, fieldsType)
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
		const fieldsType = ['string', 'string']
		super(requiredFields, fieldsType);
	}

	use(req: CustomRequest, res: Response, next: NextFunction) {
		this.checkMissingFields(req);
		return next();
	}
}

@Injectable()
export class ExtendSubscriptionMiddleware extends MissingFieldsMiddleware implements NestMiddleware {
	constructor() {
		const requiredFields = ['extension'];
		const fieldsType = ['number']
		super(requiredFields, fieldsType);
	}

	use(req: CustomRequest, res: Response, next: NextFunction) {
		this.checkMissingFields(req);
		const reqExtension = req.body['extension']
		if (typeof reqExtension === 'string') {	
			if (! /^-?\d+$/.test(reqExtension)) {
				throw new HttpException(
				  	"Invalid extension format (Must be an integer)",
				  	HttpStatus.BAD_REQUEST
				);
			}
			return next();
		} else if (typeof reqExtension === 'number') {
			if (Number.isInteger(reqExtension)) {
				return next();
			}
			throw new HttpException(
				"Invalid extension format (Must be an integer)", 
				HttpStatus.BAD_REQUEST
			)
		} else {
			throw new HttpException(
				"Invalid extension format (Must be an integer)", 
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
						"Invalid expireIn format (Must be positive integer)", 
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