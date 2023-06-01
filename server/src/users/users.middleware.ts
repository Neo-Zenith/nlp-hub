import { Injectable, NestMiddleware, HttpStatus, HttpException } from '@nestjs/common'
import { Response, NextFunction } from 'express'
import * as dotenv from 'dotenv'

import { CustomRequest } from '../common/request/request.model'
import { ValidateRequestMiddleware } from '../common/common.middleware'

dotenv.config()

@Injectable()
export class CreateUserMiddleware extends ValidateRequestMiddleware implements NestMiddleware {
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
        return next()
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
export class UpdateUserMiddleware extends ValidateRequestMiddleware implements NestMiddleware {
    constructor() {
        const fields = {
            username: { type: 'string', required: false },
            password: { type: 'string', required: false },
            name: { type: 'string', required: false },
            email: { type: 'string', required: false },
            department: { type: 'string', required: false },
        }
        super(fields)
    }

    use(req: CustomRequest, res: Response, next: NextFunction) {
        this.hasInvalidFields(req)
        return next()
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
