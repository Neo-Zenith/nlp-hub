import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    HttpStatus,
    HttpException,
} from '@nestjs/common'

import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Observable } from 'rxjs'
import * as fs from 'fs-extra'

import { CustomRequest } from '../common/request/request.model'
import {
    Service,
    ServiceEndpoint,
    ServiceEndpointModel,
    ServiceModel,
    UploadFormat,
} from '../services/services.model'
import { User, UserModel } from '../users/users.model'
import { Query, QueryModel } from './queries.model'
import { ValidateRequestBodyMiddleware } from '../common/common.middleware'

/**
 * * Validates the request body for POST /query/:type/:version/:task
 * * 1. If request body is present, check if the options provided matches the options define in the endpoint.
 * * 2. Verify that the user's subscription is still valid before allowing user to access the service.
 */
@Injectable()
export class CreateQueryInterceptor implements NestInterceptor {
    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
        const req = context.switchToHttp().getRequest<CustomRequest>()
        await this.validateSubscription(req)
        await this.validateFields(req)
        return next.handle()
    }

    async validateSubscription(req: CustomRequest): Promise<void> {
        const role = req.payload.role
        const userID = req.payload.id

        if (role === 'admin') {
            return
        }

        const user = await UserModel.findById(userID)
        const expiryDate = user.subscriptionExpiryDate
        const currentDate = new Date()
        if (currentDate > expiryDate) {
            const message =
                'Subscription expired. Please renew subscription to continue accessing this resource.'
            throw new HttpException(message, HttpStatus.FORBIDDEN)
        }

        return
    }

    async validateUploadable(req: CustomRequest, endpoint: ServiceEndpoint): Promise<void> {
        if (!req.file) {
            const message = 'Invalid request. Expected an uploadable for non-text based services.'
            throw new HttpException(message, HttpStatus.BAD_REQUEST)
        }

        const fileType = req.file.mimetype.toUpperCase()
        const supportedFormats = endpoint.supportedFormats

        const matchedType = supportedFormats.find((type) => fileType.includes(type))

        if (!matchedType) {
            await fs.unlink(req.file.path)
            const validFormats = Object.values(supportedFormats).join(', ')
            const message = `Invalid request. Expected file to be interpretable in any of '${validFormats}', but received '${fileType}'.`
            throw new HttpException(message, HttpStatus.BAD_REQUEST)
        }

        const uploadLimit: { [key in UploadFormat]: number } = {
            [UploadFormat.IMAGE]: 200,
            [UploadFormat.AUDIO]: 500,
            [UploadFormat.PDF]: 1000,
            [UploadFormat.VIDEO]: 10000,
        }

        const fileSizeLimit = uploadLimit[matchedType]

        if (fileSizeLimit && req.file.size > fileSizeLimit * 1024) {
            await fs.unlink(req.file.path)
            const message = `Invalid request. The file size exceeds the limit of ${fileSizeLimit} KB.`
            throw new HttpException(message, HttpStatus.BAD_REQUEST)
        }

        return
    }

    async validateFields(req: CustomRequest): Promise<void> {
        const { type, version, task } = req.params
        const { options } = req.body

        const service = await ServiceModel.findOne({ type, version }).exec()
        if (!service) {
            const message = 'Service not found. The requested resource could not be found.'
            throw new HttpException(message, HttpStatus.NOT_FOUND)
        }

        const serviceID = service.id
        const endpoint = await ServiceEndpointModel.findOne({ serviceID, task }).exec()
        if (!endpoint) {
            const message = 'Endpoint not found. The requested resource could not be found.'
            throw new HttpException(message, HttpStatus.NOT_FOUND)
        }

        if (!options && endpoint.options) {
            const message = 'Options do not match pre-defined schema.'
            throw new HttpException(
                { message, expectedOptions: endpoint.options },
                HttpStatus.BAD_REQUEST,
            )
        } else if (!endpoint.options) {
            return endpoint.textBased ? null : await this.validateUploadable(req, endpoint)
        } else {
            const queryOptionsFields = Object.keys(options)
            const endpointOptionsFields = Object.keys(endpoint.options)
            if (
                queryOptionsFields.length !== endpointOptionsFields.length ||
                !queryOptionsFields.every((key) => endpointOptionsFields.includes(key))
            ) {
                const message = 'Options do not match pre-defined schema.'
                throw new HttpException(
                    { message, expectedOptions: endpoint.options },
                    HttpStatus.BAD_REQUEST,
                )
            }

            for (const key of queryOptionsFields) {
                const expectedType = endpoint.options[key]
                const receivedType = typeof options[key]
                if (receivedType !== expectedType) {
                    const message = `Invalid value type for option '${key}'. Expected '${expectedType}', but received '${receivedType}'.`
                    throw new HttpException(
                        {
                            message,
                            expectedOptions: endpoint.options,
                        },
                        HttpStatus.BAD_REQUEST,
                    )
                }
            }
        }
    }
}

@Injectable()
export class RetrieveUsagesInterceptor implements NestInterceptor {
    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
        const req = context.switchToHttp().getRequest<CustomRequest>()
        if (req.query.timezone) {
            this.isValidTimezone(req)
        }
        if (req.query.executionTime) {
            this.isValidExecTime(req)
        }

        return next.handle()
    }

    private isValidTimezone(req: CustomRequest): boolean {
        const { timezone } = req.query
        const tz = parseFloat(timezone as string)

        if (tz < -12 || tz > 14) {
            const message = `Invalid timezone. Expected timezone to be between -12 and 14, but received '${tz}'.`
            throw new HttpException(message, HttpStatus.BAD_REQUEST)
        }
        return true
    }

    private isValidExecTime(req: CustomRequest): boolean {
        const { executionTime } = req.query
        const execTime = +executionTime

        if (execTime <= 0) {
            const message = `Invalid execution time. Expected a positive value but received '${execTime}'.`
            throw new HttpException(message, HttpStatus.BAD_REQUEST)
        }
        return true
    }
}

@Injectable()
export class RetrieveUsageInterceptor implements NestInterceptor {
    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
        const req = context.switchToHttp().getRequest<CustomRequest>()
        const userID = req.payload.id
        const role = req.payload.role
        const uuid = req.params.uuid
        const query = await QueryModel.findOne({ uuid: uuid })

        if (role === 'admin') {
            return next.handle()
        }

        if (!query || query.userID !== userID) {
            const message = 'Access denied. User is not authorized to access this resource.'
            throw new HttpException(message, HttpStatus.FORBIDDEN)
        }

        if (req.query.timezone) {
            this.isValidTimezone(req)
        }

        return next.handle()
    }

    private isValidTimezone(req: CustomRequest): boolean {
        const { timezone } = req.query
        const tz = parseFloat(timezone as string)

        if (tz < -12 || tz > 14) {
            const message = `Invalid timezone. Expected timezone to be between -12 and 14, but received '${tz}'.`
            throw new HttpException(message, HttpStatus.BAD_REQUEST)
        }
        return true
    }
}
