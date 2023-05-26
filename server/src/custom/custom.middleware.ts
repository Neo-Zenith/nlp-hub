import { 
    HttpException, 
    CanActivate, 
    ExecutionContext, 
    HttpStatus, 
    Injectable, 
    NestMiddleware 
} from "@nestjs/common";
import { CustomRequest } from "./request/request.model";
import { Observable } from 'rxjs';
import { Debug } from "./debug/debug";
import { NextFunction, Response } from "express";
import * as jwt from "jsonwebtoken";
import * as dotenv from "dotenv";
import * as crypto from "crypto";
import { UserModel } from "src/users/users.model";
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


abstract class AuthGuard implements CanActivate {
    constructor(private readonly allowedMethods: string[]) {}

    canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();
        const requestMethod = request.method.toUpperCase();
        if (this.allowedMethods.includes(requestMethod)) {
            return this.accessControl(request);
        }
        return false;
    }

    decryptID(encryptedID: string) {
        const iv = Buffer.from(encryptedID.slice(0, 32), 'hex'); 
        const decipher = crypto.createDecipheriv('aes-256-cbc', process.env.ENCRYPT_SECRET, iv);
        let decrypted = decipher.update(encryptedID.slice(32), 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }

    async matchRole(req: CustomRequest, role: string) {
        const authHeader = req.headers.authorization;
        req.payload = {}
        if (! authHeader || ! authHeader.startsWith('Bearer ')) {
            throw new HttpException(
                "Access token not present in header", HttpStatus.BAD_REQUEST)
        }
        
        // Check for JWT token
        const token = authHeader.split(' ')[1];

        try {
            // Verify and decode the JWT token
            const decoded = await jwt.verify(token, process.env.JWT_SECRET);
            // Set the decoded user object on the request for future use
            const decrypted = this.decryptID(decoded.meta);
            const metadata = decrypted.split('+')
            req.payload['id'] = metadata[0]
            req.payload['role'] = metadata[1]
            if (req.payload['role'] === role || req.payload['role'] === 'admin') {
                return true;
            }
            throw new HttpException("User not authorized", HttpStatus.FORBIDDEN);

        } catch (err) {
            if (err.name === 'HttpException') {
                throw new HttpException("User not authorized", HttpStatus.FORBIDDEN)
            } else if (err.name === 'JsonWebTokenError') {
                throw new HttpException(
                    "Invalid access token", HttpStatus.BAD_REQUEST)
            } else if (err.name === 'TokenExpiredError') {
                throw new HttpException(
                    "Access token expired", HttpStatus.BAD_REQUEST)
            }
        }
    }

    abstract accessControl(req: CustomRequest);
}

@Injectable()
export class UserAuthGuard extends AuthGuard {
    constructor(allowedMethods: string[]) {
        super(allowedMethods);
    }

    async accessControl(req: CustomRequest) {
        return this.matchRole(req, 'user')
    }
}

@Injectable()
export class AdminAuthGuard extends AuthGuard {
    constructor(allowedMethods: string[]) {
        super(allowedMethods);
    }

    async accessControl(req: CustomRequest) {
        return this.matchRole(req, 'admin')
    }
}