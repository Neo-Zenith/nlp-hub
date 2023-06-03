import {
    HttpException,
    CanActivate,
    ExecutionContext,
    HttpStatus,
    Injectable,
    Logger,
} from '@nestjs/common'

import { Cron } from '@nestjs/schedule'
import { HttpService } from '@nestjs/axios'

import * as jwt from 'jsonwebtoken'
import * as dotenv from 'dotenv'
import * as crypto from 'crypto'
import * as sanitize from 'mongo-sanitize'

import { CustomRequest } from './request/request.model'
import { AdminModel, UserModel } from '../users/users.model'
import { isNullOrUndefined } from '@typegoose/typegoose/lib/internal/utils'

dotenv.config()

export abstract class ValidateRequestBodyMiddleware {
    protected fields: { [field: string]: { type: string; required: boolean } }

    constructor(fields: { [field: string]: { type: string; required: boolean } }) {
        this.fields = fields
    }

    public checkFields(req: CustomRequest): void {
        this.sanitizeFields(req)
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
    }

    private sanitizeFields(req: CustomRequest): void {
        for (const field of Object.keys(this.fields)) {
            const { type } = this.fields[field]
            const fieldValue = req.body[field]

            if (!isNullOrUndefined(fieldValue) && typeof fieldValue !== type) {
                const message = `Invalid type for ${field}. Expected ${type}, but received ${typeof fieldValue}.`
                throw new HttpException(message, HttpStatus.BAD_REQUEST)
            }

            if (typeof fieldValue === 'string' && fieldValue.length === 0) {
                const message = `Invalid value for ${field}. String cannot be empty.`
                throw new HttpException(message, HttpStatus.BAD_REQUEST)
            }

            req.body[field] = sanitize(req.body[field])
        }
    }
}

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

        const userExist = await this.checkUserExist(req)
        if (userExist) {
            if (req.payload['role'] === role || req.payload['role'] === 'admin') {
                return true
            }
            const message = 'Access denied. User is not authorized to access this resource.'
            throw new HttpException(message, HttpStatus.FORBIDDEN)
        }
    }

    private async checkUserExist(req: CustomRequest): Promise<boolean> {
        if (req.payload['role'] === 'admin') {
            const user = await AdminModel.findById(req.payload['id'])
            if (!user) {
                const message =
                    'Invalid token. User could not be verified. Please re-authenticate to ontain a new access token.'
                throw new HttpException(message, HttpStatus.UNAUTHORIZED)
            }
        } else {
            const user = await UserModel.findById(req.payload['id'])
            if (!user) {
                const message =
                    'Invalid token. User could not be verified. Please re-authenticate to ontain a new access token.'
                throw new HttpException(message, HttpStatus.UNAUTHORIZED)
            }
        }
        return true
    }

    abstract allowAccess(req: CustomRequest): Promise<boolean>
}

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

@Injectable()
export class PingTask {
    private readonly logger = new Logger(PingTask.name)

    constructor(private httpService: HttpService) {}

    @Cron('*/1 * * * *') // Runs every 1 minute
    async pingServer() {
        try {
            await this.httpService.get('https://nlphub.azurewebsites.net/api').toPromise()
            this.logger.log('Self-ping successful!')
        } catch (error) {
            this.logger.error(`Error during self-ping: ${error.message}`)
        }
    }
}
