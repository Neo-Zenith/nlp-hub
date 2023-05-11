import { UserSchema } from "./user.model";
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Response, NextFunction } from 'express';
import * as jwt from "jsonwebtoken";
import * as dotenv from "dotenv";
import { CustomRequest } from "src/request/request.model";

// Set subscription expiry date during account creation
UserSchema.pre('save', function(next) {
	const now = new Date();
    if (!this.subscriptionExpiryDate) {
        const expiryDate = new Date(now);
        expiryDate.setDate(now.getDate() + 30);
        this.subscriptionExpiryDate = expiryDate;
    }
    next();
});

// Checks for validity of access token
@Injectable()
export class CheckAuthMiddleware implements NestMiddleware {
	use(req: CustomRequest, res: Response, next: NextFunction) {
		const authHeader = req.headers.authorization;
		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			req.payload = {authenticated: false}
			return this.allowAccessToRoute(req, res, next);
		}

		const authToken = authHeader.split(' ')[1];
		try {
			dotenv.config();
			const decoded = jwt.verify(authToken, process.env.JWT_SECRET);
	  
			// Check if the token is expired
			if (decoded.exp < Date.now() / 1000) {
				req.payload = {authenticated: false}
				return this.allowAccessToRoute(req, res, next);
			}
			
			// token valid, now check if the accessed route is allowed
			// not allowed routes when authenticated: signup/login
			// not allowed routes when not authenticated: everything except signup/login
			req.payload = {authenticated: true}
			return this.allowAccessToRoute(req, res, next);
			
		} catch (err) {
			console.error(err);
			req.payload = {authenticated: false}
			return res.status(401).send({ message: 'Invalid token' });
		}
	}

	// check if the route is accessible based on the auth status
	private allowAccessToRoute(req: CustomRequest, res: Response, next: NextFunction) {
		if (req.payload.authenticated) {
			if (req.baseUrl === '/users/login' || req.baseUrl === '/users/register') {
				return res.status(400).send({message: "User has already logged in"})
			}
			return next()
		}
		if (req.baseUrl === '/users/login' || req.path === '/users/register') {
			return next();
		}
		return res.status(401).send({message: "User is not authenticated"});
	}
}
