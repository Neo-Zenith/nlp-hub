import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Response, NextFunction } from 'express';
import * as jwt from "jsonwebtoken";
import * as dotenv from "dotenv";
import { CustomRequest } from "src/custom/request/request.model";
import { Debug } from 'src/custom/debug/debug';
dotenv.config();


/**
 * General interface for authentication middlewares
 */
interface CheckAuthMiddleware extends NestMiddleware {
	/**
	 * All authentication check middlewares should have custom route access protocol
	 * @param req {@link Request} object
	 * @param res {@link Response} object
	 * @param next {@link NextFunction} callback function
	 */
	allowAccessToRoute(req: CustomRequest, res: Response, next: NextFunction);
}


/**
 * Authentication check for normal users 
 * Allow access to normal routes
 */
@Injectable()
export class CheckUserAuthMiddleware implements CheckAuthMiddleware {
	use(req: CustomRequest, res: Response, next: NextFunction) {
		const authHeader = req.headers.authorization;
		req.payload = {}
		if (!authHeader || !authHeader.startsWith('Bearer ')) {
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
				Debug.devLog(null, err);
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

	/**
	 * User access protocol
	 * @param req {@link Request} object
	 * @param res {@link Response} object
	 * @param next {@link NextFunction} object
	 * @returns Error {@link HttpException} if not authorised to access; Invoke the callback function otherwise
	 */
	allowAccessToRoute(req: CustomRequest, res: Response, next: NextFunction) {
		if (req.payload.authenticated) {
			if (req.baseUrl === '/users/login' || req.baseUrl === '/users/register') {
				return res.status(400).send({message: "Bad Request (User Logged In)"})
			}
			return next()
		}
		
		//TODO modify the route potentially (currently sharing with normal users)
		if (req.baseUrl === '/users/login' || req.baseUrl === '/users/register') {
			return next();
		}
		return res.status(401).send({message: "Unauthorized (User Not Authenticated)"});
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
		console.log("IN Sudo")
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
				Debug.devLog(null, err);
				if (err.name === "JsonWebTokenError") {
					req.payload['authenticated'] = false 
					return this.allowAccessToRoute(req, res, next);
				} else if (err.name === "TokenExpiredError") {
					req.payload['authenticated'] = false 
					return res.status(401).send({ message: 'Unauthorized (Invalid Token)' });
				}			
			}

		// TODO find out other errors
		} catch (err) {
			Debug.devLog(null, err);
		}
	}

	/**
	 * Admin access protocol
	 * @param req {@link Request} object
	 * @param res {@link Response} object
	 * @param next {@link NextFunction} object
	 * @returns Error {@link HttpException} if not authorised to access; Invoke the callback function otherwise
	 */
	allowAccessToRoute(req: CustomRequest, res: Response, next: NextFunction) {
		if (req.payload.authenticated) {
			if (req.baseUrl === '/users/login' || req.baseUrl === '/users/register') {
				return res.status(400).send({ message: "Bad Request (User Logged In)" })
			}

			if (req.baseUrl.startsWith('/nlp/')) {
				return next()
			}
		}
		
		if (req.baseUrl === '/users/login' || req.baseUrl === '/users/register') {
			return next();
		}

		return res.status(403).send({ message: "Forbidden (User Not Authorized)" })
	}
}

