import { Injectable, NestMiddleware, HttpStatus, HttpException } from '@nestjs/common'
import { Response, NextFunction } from 'express'
import * as dotenv from 'dotenv'

import { CustomRequest } from '../common/request/request.model'
import { ValidateRequestMiddleware } from '../common/common.middleware'

dotenv.config()

@Injectable()
export class RegisterUserMiddleware extends ValidateRequestMiddleware implements NestMiddleware {
    constructor() {
        const fields = {
            username: { type: 'string', required: true },
            password: { type: 'string', required: true },
            name: { type: 'string', required: true },
            email: { type: 'string', required: true },
            department: { type: 'string', required: true },
        }
        super(fields)
    }

    use(req: CustomRequest, res: Response, next: NextFunction): void {
        this.hasInvalidFields(req)
        this.isStrongPassword(req)
        this.isValidEmail(req)
        return next()
    }

    private isStrongPassword(req: CustomRequest): boolean {
        const password = req.body['password']
        if (password.length < 8) {
            const message = `Password does not meet requirements. Expected password to be at least 8 characters, but received ${password.length} characters.`
            throw new HttpException(message, HttpStatus.BAD_REQUEST)
        }
        return true
    }

    private isValidEmail(req: CustomRequest): boolean {
        const email = req.body['email']
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

        if (!emailRegex.test(email)) {
            const message = `Invalid email address format.`
            throw new HttpException(message, HttpStatus.BAD_REQUEST)
        }
        return true
    }
}

@Injectable()
export class LoginUserMiddleware extends ValidateRequestMiddleware implements NestMiddleware {
    constructor() {
        const fields = {
            username: { type: 'string', required: true },
            password: { type: 'string', required: true },
        }
        super(fields)
    }

    use(req: CustomRequest, res: Response, next: NextFunction): void {
        this.hasInvalidFields(req)
        return next()
    }
}

@Injectable()
export class ExtendSubscriptionMiddleware
    extends ValidateRequestMiddleware
    implements NestMiddleware
{
    constructor() {
        const fields = {
            extension: { type: 'number', required: true },
        }
        super(fields)
    }

    use(req: CustomRequest, res: Response, next: NextFunction): void {
        this.hasInvalidFields(req)
        const reqExtension = req.body['extension']
        if (Number.isInteger(reqExtension)) {
            return next()
        }
        const message = `Invalid extension format. Expected an integer, but received '${typeof reqExtension}'.`
        throw new HttpException(message, HttpStatus.BAD_REQUEST)
    }
}

@Injectable()
export class RetrieveUsersMiddleware implements NestMiddleware {
    use(req: CustomRequest, res: Response, next: NextFunction): void {
        const reqExpireIn = req.query['expireIn'] as string
        if (reqExpireIn) {
            if (!/^\d+$/.test(reqExpireIn)) {
                const message = `Invalid expireIn format. Expected a parsable non-negative integer, but received '${reqExpireIn}'.`
                throw new HttpException(message, HttpStatus.BAD_REQUEST)
            }
            const expireIn = parseInt(reqExpireIn)
            if (expireIn < 0) {
                const message = `Invalid expireIn format. Expected a non-negative integer, but received '${reqExpireIn}'.`
                throw new HttpException(message, HttpStatus.BAD_REQUEST)
            }
            return next()
        }

        return next()
    }
}
