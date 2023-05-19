import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { CustomRequest } from "./request/request.model";
import { Debug } from "./debug/debug";
import { NextFunction, Response } from "express";
import * as jwt from "jsonwebtoken";

export abstract class MissingFieldsMiddleware {
    protected requiredFields;

    constructor(requiredFields: string[]) {
        this.requiredFields = requiredFields;
    }

    checkMissingFields(req: CustomRequest) {
        var requestBody;

        if (req.method === 'POST') {
            requestBody = req.body;
        } else if (req.method === 'GET') {
            requestBody = req.params;
        }

        const missingFields = this.requiredFields.filter((field) => ! requestBody[field]);
        if (missingFields.length > 0) {
            const message = `Incomplete body (${missingFields.join(', ')})`
            Debug.devLog("MissingFieldsMiddleware", message)
            throw new HttpException(message, 
                                    HttpStatus.BAD_REQUEST);
        }
        return false;
    }
}

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
				return res.status(401).send({ message: 'Invalid access token' });
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
			'/admins/register', '/services/unsubscribe', 
			'/services/subscribe', '/services/update', '/endpoints/add',
			'/endpoints/remove', '/endpoints/update'
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