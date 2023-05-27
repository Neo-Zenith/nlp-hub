import {
    Injectable,
    NestMiddleware,
    HttpStatus,
    HttpException,
} from '@nestjs/common'
import { Response, NextFunction } from 'express'
import * as dotenv from 'dotenv'

import { CustomRequest } from 'src/common/request/request.model'
import { ValidateRequestMiddleware } from 'src/common/common.middleware'

dotenv.config()

@Injectable()
export class RegisterUserMiddleware
    extends ValidateRequestMiddleware
    implements NestMiddleware
{
    constructor() {
        const requiredFields = [
            'name',
            'username',
            'email',
            'password',
            'department',
        ]
        const fieldsType = ['string', 'string', 'string', 'string', 'string']
        super(requiredFields, fieldsType)
    }

    use(req: CustomRequest, res: Response, next: NextFunction) {
        this.hasInvalidFields(req)
        this.isStrongPassword(req)
        return next()
    }

    private isStrongPassword(req) {
        const password = req.body['password']
        if (password.length < 8) {
            throw new HttpException(
                'Password does not meet minimum requirements',
                HttpStatus.BAD_REQUEST,
            )
        }
        return true
    }
}

@Injectable()
export class LoginUserMiddleware
    extends ValidateRequestMiddleware
    implements NestMiddleware
{
    constructor() {
        const requiredFields = ['username', 'password']
        const fieldsType = ['string', 'string']
        super(requiredFields, fieldsType)
    }

    use(req: CustomRequest, res: Response, next: NextFunction) {
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
        const requiredFields = ['extension']
        const fieldsType = ['number']
        super(requiredFields, fieldsType)
    }

    use(req: CustomRequest, res: Response, next: NextFunction) {
        this.hasInvalidFields(req)
        const reqExtension = req.body['extension']
        if (Number.isInteger(reqExtension)) {
            return next()
        }
        throw new HttpException(
            'Invalid extension format (Must be an integer)',
            HttpStatus.BAD_REQUEST,
        )
    }
}

@Injectable()
export class RetrieveUsersMiddleware implements NestMiddleware {
    use(req: CustomRequest, res: Response, next: NextFunction) {
        const reqExpireIn = req.query['expireIn'] as string
        if (reqExpireIn) {
            if (!/^\d+$/.test(reqExpireIn)) {
                throw new HttpException(
                    'Invalid expireIn format (Must be a non-negative integer)',
                    HttpStatus.BAD_REQUEST,
                )
            }
            const expireIn = parseInt(reqExpireIn)
            if (expireIn < 0) {
                throw new HttpException(
                    'Invalid expireIn format (Must be a non-negative integer)',
                    HttpStatus.BAD_REQUEST,
                )
            }
            return next()
        }

        return next()
    }
}
