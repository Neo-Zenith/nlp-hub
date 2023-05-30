import {
    Injectable,
    ExecutionContext,
    NestInterceptor,
    HttpStatus,
    CallHandler,
    HttpException,
} from '@nestjs/common'

import { Model } from 'mongoose'
import { InjectModel } from '@nestjs/mongoose'

import { CustomRequest } from '../common/request/request.model'
import { User } from './users.model'
import { ValidateRequestMiddleware } from '../common/common.middleware'
import { Observable } from 'rxjs'

@Injectable()
export class ModifyUserInterceptor extends ValidateRequestMiddleware implements NestInterceptor {
    constructor(@InjectModel('User') private readonly userModel: Model<User>) {
        const fields = {
            username: { type: 'string', required: false },
            password: { type: 'string', required: false },
            name: { type: 'string', required: false },
            email: { type: 'string', required: false },
            department: { type: 'string', required: false },
        }
        super(fields)
    }

    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
        const req = context.switchToHttp().getRequest<CustomRequest>()
        const payload = req.payload
        const username = req.params.username

        const userID = payload['id']
        const role = payload['role']

        this.hasInvalidFields(req)
        if (req.body['password']) {
            this.isStrongPassword(req)
        }
        if (req.body['email']) {
            this.isValidEmail(req)
        }

        if (role === 'admin') {
            return next.handle()
        }

        const user = await this.retrieveUser(username)
        if (user.id === userID) {
            return next.handle()
        }

        const message = 'Access denied. User is not authorized to access this resource.'
        throw new HttpException(message, HttpStatus.FORBIDDEN)
    }

    private async retrieveUser(username: string): Promise<User> {
        const user = await this.userModel.findOne({ username })
        if (!user) {
            const message = 'Access denied. User is not authorized to access this resource.'
            throw new HttpException(message, HttpStatus.FORBIDDEN)
        }
        return user
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

    private isStrongPassword(req: CustomRequest): boolean {
        const password = req.body['password']
        if (password.length < 8) {
            const message = `Password does not meet requirements. Expected password to be at least 8 characters, but received ${password.length} characters.`
            throw new HttpException(message, HttpStatus.BAD_REQUEST)
        }
        return true
    }
}
