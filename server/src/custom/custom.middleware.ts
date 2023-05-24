import { HttpException, HttpStatus, Injectable, NestMiddleware } from "@nestjs/common";
import { CustomRequest } from "./request/request.model";
import { Debug } from "./debug/debug";
import { NextFunction, Response } from "express";
import * as jwt from "jsonwebtoken";
import * as dotenv from "dotenv";
import * as crypto from "crypto";
import { UserModel } from "src/users/user.model";
dotenv.config()

export abstract class MissingFieldsMiddleware {
    protected requiredFields;

    constructor(requiredFields: string[]) {
        this.requiredFields = requiredFields;
    }

    checkMissingFields(req: CustomRequest) {
        const missingFields = this.requiredFields.filter((field) => ! req.body[field]);
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
        const isPublicRoute = this.isPublicRoute(baseUrl);
        const isAdminRoute = this.isAdminRoute(baseUrl);
        const authHeader = req.headers.authorization;
        req.payload = {};

        if (! isPublicRoute) {
            if (! authHeader || ! authHeader.startsWith('Bearer ')) {
                return res.status(400).json({ 
                    message: "Access token is not present" 
                })
            }
            
            // Check for JWT token
            const token = req.headers.authorization.split(' ')[1];

            try {
                // Verify and decode the JWT token
                const decoded = await jwt.verify(token, process.env.JWT_SECRET);
                // Set the decoded user object on the request for future use
                const decrypted = this.decryptID(decoded.meta);
                const metadata = decrypted.split('+')
                req.payload['id'] = metadata[0]
                req.payload['role'] = metadata[1]

                if (isAdminRoute) {
                    // Check if the user is an admin
                    const isAdmin = req.payload['role'] === 'admin';

                    if (! isAdmin) {
                        return res.status(403).json({ 
                            message: 'User not authorized' 
                        });
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

    private isPublicRoute(url: string): boolean {
        const publicRoutes = [
            '/users/register',
            '/users/login',
            '/admins/login',
        ];

        return publicRoutes.includes(url);
    }

    private isAdminRoute(url: string): boolean {
        const restrictedRoutes = [
            '/admins/register',
            '/admins/extend-subscription',
            '/admins/get-users',
            '/services/unsubscribe',
            '/services/subscribe',
            '/services/update',
            '/endpoints/add',
            '/endpoints/remove',
            '/endpoints/update',
        ];

        for (const route of restrictedRoutes) {
            if (url.includes(route)) {
                return true;
            }
        }
        return false;
    }

    private decryptID(encryptedID: string) {
        const iv = Buffer.from(encryptedID.slice(0, 32), 'hex'); 
        const decipher = crypto.createDecipheriv('aes-256-cbc', process.env.ENCRYPT_SECRET, iv);
        let decrypted = decipher.update(encryptedID.slice(32), 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }

    private async retrieveUser(userID: string) {
        const user = await UserModel.findById(userID);
        if (! user) {
            throw new HttpException("User not found", HttpStatus.NOT_FOUND);
        }
        return user;
    }
}