import {
    Injectable,
    ExecutionContext,
    NestInterceptor,
    HttpStatus,
    CallHandler,
    HttpException,
} from '@nestjs/common'

import { CustomRequest } from '../common/request/request.model'
import { Admin, User, UserModel } from './users.model'
import { Observable } from 'rxjs'

class CredentialsValidator {
    public static isValidEmail(req: CustomRequest): boolean {
        const email = req.body.email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

        if (!emailRegex.test(email)) {
            const message = `Invalid email address format.`
            throw new HttpException(message, HttpStatus.BAD_REQUEST)
        }
        return true
    }

    public static isStrongPassword(req: CustomRequest): boolean {
        const password = req.body.password
        if (password.length < 8) {
            const message = `Password does not meet requirements. Expected password to be at least 8 characters, but received ${password.length} characters.`
            throw new HttpException(message, HttpStatus.BAD_REQUEST)
        }
        return true
    }

    public static isValidUsername(req: CustomRequest): boolean {
        const username = req.body.username
        const pattern = /^[a-zA-Z0-9]{5,}$/
        if (pattern.test(username)) {
            const message =
                'Invalid username. Expected username to be at least 5 characters and must only contain alphanumerics.'
            throw new HttpException(message, HttpStatus.BAD_REQUEST)
        }
        return true
    }
}

@Injectable()
export class CreateUserInterceptor implements NestInterceptor {
    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
        const req = context.switchToHttp().getRequest<CustomRequest>()
        CredentialsValidator.isValidUsername(req)
        CredentialsValidator.isValidEmail(req)
        CredentialsValidator.isStrongPassword(req)
        return next.handle()
    }
}

@Injectable()
export class UpdateUserInterceptor implements NestInterceptor {
    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
        const req = context.switchToHttp().getRequest<CustomRequest>()
        const userID = req.payload.id
        const role = req.payload.role
        const username = req.params.username

        if (req.body.username) {
            CredentialsValidator.isValidUsername(req)
        }
        if (req.body.email) {
            CredentialsValidator.isValidEmail(req)
        }
        if (req.body.password) {
            CredentialsValidator.isStrongPassword(req)
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
        const user = await UserModel.findOne({ username })
        if (!user) {
            const message = 'Access denied. User is not authorized to access this resource.'
            throw new HttpException(message, HttpStatus.FORBIDDEN)
        }
        return user
    }
}

@Injectable()
export class RetrieveUserInterceptor implements NestInterceptor {
    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
        const request = context.switchToHttp().getRequest()
        const userID = request.payload.id
        const role = request.payload.role
        const targetUsername = request.params.username

        let user: User | Admin
        if (role === 'admin') {
            return next.handle()
        } else {
            user = await UserModel.findById(userID)
        }

        if (user.username !== targetUsername) {
            const message = 'Access denied. User is not authorized to access this resource.'
            throw new HttpException(message, HttpStatus.FORBIDDEN)
        }

        return next.handle()
    }
}
