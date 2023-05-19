import { Injectable, HttpException, NestMiddleware, HttpStatus } from '@nestjs/common';
import { Response, NextFunction } from 'express';
import * as jwt from "jsonwebtoken";
import * as dotenv from "dotenv";
import { CustomRequest } from "src/custom/request/request.model";
import { Debug } from 'src/custom/debug/debug';
import { MissingFieldsMiddleware } from 'src/custom/custom.middleware';
dotenv.config();


@Injectable()
export class CheckAuthMiddleware {
	use(req: CustomRequest, res: Response, next: NextFunction) {
		const authHeader = req.headers.authorization;
		req.payload = {};
		if (! authHeader || ! authHeader.startsWith('Bearer ')) {
			req.payload['authenticated'] = false;
			return this.allowAccessToRoute(req, res, next);
		}

		const authToken = authHeader.split(' ')[1];
		try {
			const decodedData = jwt.verify(authToken, process.env.JWT_SECRET);
			req.payload['id'] = decodedData.id;
			req.payload['authenticated'] = true;
			req.payload['role'] = decodedData.role;

		} catch (err) {
			Debug.devLog('CheckAuthMiddleware', err);
			// Invalid token 
			if (err.name === "JsonWebTokenError") {
				req.payload['authenticated'] = false;
				return res.status(401).send({ message: 'Access token invalid' });
			} else if (err.name === "TokenExpiredError") { // Token expired
				req.payload['authenticated'] = false;
				return res.status(401).send({ message: 'Access token expired' });
			} 
		}

		// token valid, now check if the accessed route is allowed
		return this.allowAccessToRoute(req, res, next);
	}

	allowAccessToRoute(req: CustomRequest, res: Response, next: NextFunction) {
		const restrictedRoutes = [
			'/admins/register', '/nlp/unregister', 
			'/nlp/register', '/nlp/update', '/nlp/endpoints'
		]

		if (req.payload.authenticated) {
			if (req.payload.role === 'user') {
				if (restrictedRoutes.some((route) => req.baseUrl.startsWith(route))) {
					throw new HttpException("User not authorized", HttpStatus.FORBIDDEN)
				}

				if (req.baseUrl.startsWith('/users')) {
					throw new HttpException("User already logged in", HttpStatus.UNAUTHORIZED)
				}
				return next();
			}
			else {
				if (restrictedRoutes.some((route) => req.baseUrl.startsWith(route))
					&& ! req.baseUrl.startsWith('/admins/login')) {
					return next();
				}

				if (req.baseUrl.startsWith('/admins/login')) {
					throw new HttpException("User already logged in", HttpStatus.UNAUTHORIZED)
				}
				return next();
			}
		}

		if (req.baseUrl.startsWith('/users') 
			|| req.baseUrl.startsWith('/admins/login')) {
			return next();
		}
		throw new HttpException("User not authenticated", HttpStatus.UNAUTHORIZED)
	}
}


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