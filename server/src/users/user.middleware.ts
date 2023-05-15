import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Response, NextFunction } from 'express';
import * as jwt from "jsonwebtoken";
import * as dotenv from "dotenv";
import { CustomRequest } from "src/custom/request/request.model";
dotenv.config();


// All authentication check middlewares should have custom route access protocol
interface CheckAuthMiddleware extends NestMiddleware {
	allowAccessToRoute(req: CustomRequest, res: Response, next: NextFunction);
}


// Checks for validity of access token
@Injectable()
export class CheckUserAuthMiddleware implements CheckAuthMiddleware {
	use(req: CustomRequest, res: Response, next: NextFunction) {
		const authHeader = req.headers.authorization;
		req.payload = {}
		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			req.payload['authenticated'] = false 
			return this.allowAccessToRoute(req, res, next);
		}

		const authToken = authHeader.split(' ')[1];
		try {
			try {
				const decoded = jwt.verify(authToken, process.env.JWT_SECRET);
				// token valid, now check if the accessed route is allowed
				// not allowed routes when authenticated: signup/login
				// not allowed routes when not authenticated: everything except signup/login
				req.payload['authenticated'] = true 
				req.payload['role'] = decoded.role
				
				return this.allowAccessToRoute(req, res, next);
			}
			catch (err) {
				console.log(err);
				req.payload['authenticated'] = false 
				return this.allowAccessToRoute(req, res, next);
			}
			
		} catch (err) {
			console.error(err);
			req.payload['authenticated'] = false 
			return res.status(401).send({ message: 'Invalid token' });
		}
	}

	// user access protocol
	allowAccessToRoute(req: CustomRequest, res: Response, next: NextFunction) {
		if (req.payload.authenticated) {
			if (req.baseUrl === '/users/login' || req.baseUrl === '/users/register') {
				return res.status(400).send({message: "User has already logged in"})
			}
			return next()
		}
		
		if (req.baseUrl === '/users/login' || req.baseUrl === '/users/register') {
			return next();
		}
		return res.status(401).send({message: "User is not authenticated"});
	}
}

@Injectable()
export class CheckAdminAuthMiddleware implements CheckAuthMiddleware {
    use(req: CustomRequest, res: Response, next: NextFunction) {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
			req.payload['authenticated'] = false 
			this.allowAccessToRoute(req, res, next);
		}

		const authToken = authHeader.split(' ')[1];
		try {
			try {
				const decoded = jwt.verify(authToken, process.env.JWT_SECRET);
				// token valid, now check if user is an admin
				req.payload['userID'] = decoded.id
				req.payload['role'] = decoded.role

				if (decoded.role != 'admin') {
					req.payload['authenticated'] = false 
				} else {
					req.payload['authenticated'] = true 
				}
				this.allowAccessToRoute(req, res, next);
			}
			catch (err) {
				console.log(err);
				req.payload['authenticated'] = false 
				this.allowAccessToRoute(req, res, next);
			}
			
		} catch (err) {
			console.error(err);
			req.payload['authenticated'] = false 
			return res.status(401).send({ message: 'Invalid token' });
		}
	}

	// admin access protocol
	allowAccessToRoute(req: CustomRequest, res: Response, next: NextFunction) {
		if (req.payload.authenticated) {
			if (req.baseUrl === '/users/login' || req.baseUrl === '/users/register') {
				return res.status(400).send({ message: "User has already logged in" })
			}

			if (req.baseUrl.startsWith('/nlp/')) {
				return next()
			}
		}
		
		if (req.baseUrl === '/users/login' || req.baseUrl === '/users/register') {
			return next();
		}

		return res.status(403).send({ message: "Forbidden accesss" })
	}
}

