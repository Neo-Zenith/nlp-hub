import { HttpException, HttpStatus, Injectable, NestMiddleware } from "@nestjs/common";
import { CustomRequest } from "./request/request.model";
import { Debug } from "./debug/debug";
import { NextFunction, Response } from "express";
import * as jwt from "jsonwebtoken";
import * as dotenv from "dotenv";
dotenv.config()

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
export class CheckAuthMiddleware implements NestMiddleware {
    async use(req: CustomRequest, res: Response, next: NextFunction) {
        const { baseUrl } = req;
        const isPublicRoute = this.isPublic(baseUrl);
        const isAdminRoute = this.isAdmin(baseUrl);
        const authHeader = req.headers.authorization;
        req.payload = {};


        if (! isPublicRoute) {
            if (! authHeader || ! authHeader.startsWith('Bearer ')) {
                return res.status(400).json({ message: "Access token is not present" })
            }
            
            // Check for JWT token
            const token = req.headers.authorization.split(' ')[1];

            try {
                // Verify and decode the JWT token
                const decoded = await jwt.verify(token, process.env.JWT_SECRET);
                // Set the decoded user object on the request for future use
                req.payload['userID'] = decoded.id;
                req.payload['role'] = decoded.role;
 
                if (isAdminRoute) {
                    // Check if the user is an admin
                    const isAdmin = decoded.role === 'admin';

                    if (! isAdmin) {
                        return res.status(403).json({ message: 'User not authorized' });
                    }
                }

                return next();

            } catch (err) {
                if (err.name === 'JsonWebTokenError') {
                    return res.status(400).json({ message: 'Invalid access token' })
                } else if (err.name === 'TokenExpiredError') {
                    return res.status(400).json({ message: 'Access token expired' })
                }
            }

        } else {
            return next();
        }
    }

    isPublic(url: string): boolean {
        const publicRoutes = [
            '/users/register',
            '/users/login',
            '/admins/login',
        ];

        return publicRoutes.includes(url);
    }

    isAdmin(url: string): boolean {
        const restrictedRoutes = [
            '/admins/register',
            '/services/unsubscribe',
            '/services/subscribe',
            '/services/update',
            '/endpoints/add',
            '/endpoints/remove',
            '/endpoints/update',
        ];

        return restrictedRoutes.includes(url);
    }
}