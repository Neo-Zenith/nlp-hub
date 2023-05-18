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
			req.payload['authenticated'] = false;
			return this.allowAccessToRoute(req, res, next);
		}

		const authToken = authHeader.split(' ')[1];
		try {
			const decodedData = jwt.verify(authToken, process.env.JWT_SECRET);
			req.payload['id'] = decodedData.id;
			req.payload['authenticated'] = true;
			req.payload['role'] = decodedData.role;

			// token valid, now check if the accessed route is allowed
			return this.allowAccessToRoute(req, res, next);

		} catch (err) {
			Debug.devLog('CheckUserAuthMiddleware', err);
			// Invalid token 
			if (err.name === "JsonWebTokenError") {
				req.payload['authenticated'] = false;
				return this.allowAccessToRoute(req, res, next);
			} else if (err.name === "TokenExpiredError") { // Token expired
				req.payload['authenticated'] = false;
				return res.status(401).send({ message: 'Access token expired' });
			}			
		}
	}

	allowAccessToRoute(req: CustomRequest, res: Response, next: NextFunction) {
		if (req.payload.authenticated) {
			if (req.baseUrl === '/users/login' || req.baseUrl === '/users/register') {
				const message = "User already logged in";
				Debug.devLog('CheckUserAuthMiddleware', message);
				return res.status(400).send({ message: message });
			}
			return next();
		}
		
		if (req.baseUrl === '/users/login' || req.baseUrl === '/users/register') {
			return next();
		}
		const message = "User not authenticated"
		Debug.devLog('CheckUserAuthMiddleware', message)
		return res.status(401).send({ message: message  });
	}
}



@Injectable()
export class CheckAdminAuthMiddleware implements CheckAuthMiddleware {
    use(req: CustomRequest, res: Response, next: NextFunction) {
        const authHeader = req.headers.authorization;
		req.payload = {};
        if (! authHeader || ! authHeader.startsWith('Bearer ')) {
			req.payload['authenticated'] = false;
			return this.allowAccessToRoute(req, res, next);
		}

		const authToken = authHeader.split(' ')[1];
		try {
			const decoded = jwt.verify(authToken, process.env.JWT_SECRET);
			// token valid, now check if user is an admin
			req.payload['id'] = decoded.id;
			req.payload['role'] = decoded.role

			if (decoded.role !== 'admin') {
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
				return res.status(401).send({ message: "Access token expired" });
			}			
		}
	}

	allowAccessToRoute(req: CustomRequest, res: Response, next: NextFunction) {
		if (req.payload.authenticated) {
			if (req.baseUrl === '/admins/login') {
				const message = "User already logged in"
				Debug.devLog("CheckAdminAuthMiddleware", message);
				return res.status(400).send({ message: message })
			}
			return next();
		}
		
		if (req.baseUrl === '/admins/login') {
			return next();
		}
		const message = "User unauthorized"
		Debug.devLog("CheckAdminAuthMiddleware", message)
		return res.status(403).send({ message: message })
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