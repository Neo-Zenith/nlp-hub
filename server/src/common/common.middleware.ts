import {
    HttpException,
    CanActivate,
    ExecutionContext,
    HttpStatus,
    Injectable,
} from '@nestjs/common'

import * as jwt from 'jsonwebtoken'
import * as dotenv from 'dotenv'
import * as crypto from 'crypto'
import * as sanitize from 'mongo-sanitize'

import { CustomRequest } from './request/request.model'

dotenv.config()

/**
 * * Validates the request body by:
 * * 1. Check if all required fields are present.
 * * 2. Check if each field has the correct value type (to prevents malicious SQL injections).
 * ? All POST/PUT request middlewares with a request body must extend this middleware.
 */
export abstract class ValidateRequestMiddleware {
    protected fields: { [field: string]: { type: string; required: boolean } }

    constructor(fields: { [field: string]: { type: string; required: boolean } }) {
        this.fields = fields
    }

    public hasInvalidFields(req: CustomRequest): boolean {
        const missingFields = Object.keys(this.fields).filter((field) => {
            if (this.fields[field].required) {
                return !req.body[field]
            }
            return false
        })

        if (missingFields.length > 0) {
            const message = `Incomplete body. Expected ${missingFields.join(', ')}.`
            throw new HttpException(message, HttpStatus.BAD_REQUEST)
        }

        this.sanitizeFields(req)
        return false
    }

    private sanitizeFields(req: CustomRequest): void {
        for (const field of Object.keys(this.fields)) {
            const { type } = this.fields[field]
            const fieldValue = req.body[field]

            if (typeof fieldValue !== type) {
                const message = `Invalid type for ${field}. Expected ${type}, but received ${typeof fieldValue}.`
                throw new HttpException(message, HttpStatus.BAD_REQUEST)
            }

            req.body[field] = sanitize(req.body[field])
        }
    }
}

/**
 * * Provides custom access control based on:
 * * 1. User roles (implementation logic found in matchRoles, role to be provided by inheriting Guard class).
 * * 2. HTTP method (implementation done by providing allowedMethods during class construction. Methods are not case-sensitive).
 * ? Admin guard and User guard must extend this class and provide the implementation for the abstract method allowAccess which will utilise the matchRole method.
 */
abstract class AuthGuard implements CanActivate {
    constructor(private readonly allowedMethods: string[]) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest()
        const requestMethod = request.method.toUpperCase()
        if (this.allowedMethods.includes(requestMethod)) {
            const allowAccess = await this.allowAccess(request)
            return allowAccess
        }
        return false
    }

    public decryptID(encryptedID: string) {
        const iv = Buffer.from(encryptedID.slice(0, 32), 'hex')
        const decipher = crypto.createDecipheriv('aes-256-cbc', process.env.ENCRYPT_SECRET, iv)
        let decrypted = decipher.update(encryptedID.slice(32), 'hex', 'utf8')
        decrypted += decipher.final('utf8')
        return decrypted
    }

    async matchRole(req: CustomRequest, role: string): Promise<boolean> {
        const authHeader = req.headers.authorization
        req.payload = {}
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            const message = 'Token not found. Expected access token in request header.'
            throw new HttpException(message, HttpStatus.UNAUTHORIZED)
        }

        const token = authHeader.split(' ')[1]
        try {
            const decoded = await jwt.verify(token, process.env.JWT_SECRET)
            const decrypted = this.decryptID(decoded.meta)
            const metadata = decrypted.split('+')
            req.payload['id'] = metadata[0]
            req.payload['role'] = metadata[1]
        } catch (err) {
            if (err.name === 'JsonWebTokenError') {
                const message =
                    'Invalid token. Please include a valid access token in request header.'
                throw new HttpException(message, HttpStatus.UNAUTHORIZED)
            } else if (err.name === 'TokenExpiredError') {
                const message =
                    'Invalid token. Please re-authenticate to ontain a new access token.'
                throw new HttpException(message, HttpStatus.UNAUTHORIZED)
            }
        }

        if (req.payload['role'] === role || req.payload['role'] === 'admin') {
            return true
        }
        const message = 'Access denied. User is not authorized to access this resource.'
        throw new HttpException(message, HttpStatus.FORBIDDEN)
    }

    abstract allowAccess(req: CustomRequest): Promise<boolean>
}

/**
 * * Guards user-level routes. Only users who are authenticated can access.
 * * If user is not authenticated, the guard will prohibit access to the route requested.
 * ? Must be implemented by all routes except restricted routes & public routes. Restricted routes will be handled by Admin guard.
 */
@Injectable()
export class UserAuthGuard extends AuthGuard {
    constructor(allowedMethods: string[]) {
        super(allowedMethods)
    }

    async allowAccess(req: CustomRequest): Promise<boolean> {
        return this.matchRole(req, 'user')
    }
}

/**
 * * Guards admin-level routes. Only admins can access.
 * * If user is neither an admin nor authenticated, the guard will deny access to the requested route.
 * ? Must be implemented only for restricted routes.
 */
@Injectable()
export class AdminAuthGuard extends AuthGuard {
    constructor(allowedMethods: string[]) {
        super(allowedMethods)
    }

    async allowAccess(req: CustomRequest) {
        return this.matchRole(req, 'admin')
    }
}
