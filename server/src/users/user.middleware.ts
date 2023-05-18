import { Injectable, NestMiddleware } from '@nestjs/common';
import { Response, NextFunction } from 'express';
import * as jwt from "jsonwebtoken";
import * as dotenv from "dotenv";
import { CustomRequest } from "src/custom/request/request.model";
import { Debug } from 'src/custom/debug/debug';
import { MissingFieldsMiddleware } from 'src/custom/custom.middleware';
dotenv.config();


interface CheckAuthMiddleware extends NestMiddleware {
	use(req: CustomRequest, res: Response, next: NextFunction);
	allowAccessToRoute(req: CustomRequest, res: Response, next: NextFunction);
}


@Injectable()
export class CheckUserAuthMiddleware implements CheckAuthMiddleware {
	use(req: CustomRequest, res: Response, next: NextFunction) {
		const authHeader = req.headers.authorization;
		req.payload = {};
		if (! authHeader || ! authHeader.startsWith('Bearer ')) {
			req.payload['authenticated'] = false 
			return this.allowAccessToRoute(req, res, next);
		}

		try {
			const authToken = authHeader.split(' ')[1];
			try {
				const decoded = jwt.verify(authToken, process.env.JWT_SECRET);
				// token valid, now check if the accessed route is allowed
				// not allowed routes when authenticated: signup/login
				// not allowed routes when not authenticated: everything except signup/login
				req.payload['id'] = decoded.id;
				req.payload['authenticated'] = true 
				req.payload['role'] = decoded.role
				
				return this.allowAccessToRoute(req, res, next);

			} catch (err) {
				Debug.devLog('CheckUserAuthMiddleware', err);
				if (err.name === "JsonWebTokenError") {
					req.payload['authenticated'] = false 
					return this.allowAccessToRoute(req, res, next);
				} else if (err.name === "TokenExpiredError") {
					req.payload['authenticated'] = false 
					return res.status(401).send({ message: 'Unauthorized (Token Expired)' });
				}			
			}
		
		// TODO find out other errors
		} catch (err) {
			Debug.devLog(null, err);
			console.log(err.name)
		}
	}

	allowAccessToRoute(req: CustomRequest, res: Response, next: NextFunction) {
		if (req.payload.authenticated) {
			if (req.baseUrl === '/users/login' || req.baseUrl === '/users/register') {
				return res.status(400).send({message: "User already logged in"})
			}
			return next()
		}
		
		if (req.baseUrl === '/users/login' || req.baseUrl === '/users/register') {
			return next();
		}
		return res.status(401).send({message: "User not authenticated"});
	}
}

/**
 * Authentication check for admin accounts
 * Allow access to restricted routes
 */
@Injectable()
export class CheckAdminAuthMiddleware implements CheckAuthMiddleware {
    use(req: CustomRequest, res: Response, next: NextFunction) {
        const authHeader = req.headers.authorization;
		req.payload = {};
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
			req.payload['authenticated'] = false 
			return this.allowAccessToRoute(req, res, next);
		}

		try {
			const authToken = authHeader.split(' ')[1];
			try {
				const decoded = jwt.verify(authToken, process.env.JWT_SECRET);
				// token valid, now check if user is an admin
				req.payload['id'] = decoded.id;
				req.payload['role'] = decoded.role

				if (decoded.role != 'admin') {
					req.payload['authenticated'] = false 
				} else {
					req.payload['authenticated'] = true 
				}
				return this.allowAccessToRoute(req, res, next);
			} catch (err) {
				Debug.devLog('CheckAdminAuthMiddleware', err);
				if (err.name === "JsonWebTokenError") {
					req.payload['authenticated'] = false 
					return this.allowAccessToRoute(req, res, next);
				} else if (err.name === "TokenExpiredError") {
					req.payload['authenticated'] = false 
					return res.status(401).send({ message: 'Access token expired' });
				}			
			}

		// TODO find out other errors
		} catch (err) {
			Debug.devLog(null, err);
		}
	}

	allowAccessToRoute(req: CustomRequest, res: Response, next: NextFunction) {
		if (req.payload.authenticated) {
			if (req.baseUrl === '/admins/login' || req.baseUrl === '/admins/register') {
				return res.status(400).send({ message: "User already logged in" })
			}
			return next();
		}
		
		if (req.baseUrl === '/admins/login' || req.baseUrl === '/admins/register') {
			return next();
		}

		return res.status(403).send({ message: "User unauthorized" })
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