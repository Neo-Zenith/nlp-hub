import { UserSchema } from "./user.model";
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from "jsonwebtoken";
import * as dotenv from "dotenv";

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
	use(req: Request, res: Response, next: NextFunction) {
		const authHeader = req.headers.authorization;
		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			return next();
		}

		const authToken = authHeader.split(' ')[1];
		try {
			dotenv.config();
			const decoded = jwt.verify(authToken, process.env.JWT_SECRET);
	  
			// Check if the token is expired
			if (decoded.exp < Date.now() / 1000) {
				return next();
			}
			
			return res.status(400).send({message: 'User has already login', payload: decoded})
			
		  } catch (err) {
			console.error(err);
			return res.status(401).send({ message: 'Invalid token' });
		}
	}
}