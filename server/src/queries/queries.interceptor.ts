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

import { CustomRequest } from '../common/request/request.model'
import { Service, ServiceEndpoint } from '../services/services.model'
import { User } from '../users/users.model'
import { Query } from './queries.model'
import { ValidateRequestMiddleware } from '../common/common.middleware'
import { isNullOrUndefined } from '@typegoose/typegoose/lib/internal/utils'

/**
 * * Validates the request body for POST /query/:type/:version/:task
 * * 1. If request body is present, check if the options provided matches the options define in the endpoint.
 * * 2. Verify that the user's subscription is still valid before allowing user to access the service.
 */
@Injectable()
export class RegisterQueryInterceptor extends ValidateRequestMiddleware implements NestInterceptor {
    constructor(
        @InjectModel('User') private readonly userModel: Model<User>,
        @InjectModel('Service') private readonly serviceModel: Model<Service>,
        @InjectModel('ServiceEndpoint')
        private readonly serviceEndpointModel: Model<ServiceEndpoint>,
    ) {
        const fields = {
            options: { type: 'object', required: false },
        }
        super(fields)
    }

    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
        const req = context.switchToHttp().getRequest<CustomRequest>()

        const validSubscription = await this.validateSubscription(req)
        await this.hasInvalidFields(req)
        if (validSubscription) {
            const validFields = await this.validateFields(req)
            if (validFields) {
                return next.handle()
            }
        }
    }

    async validateSubscription(req: CustomRequest): Promise<boolean> {
        const role = req.payload.role
        if (role === 'admin') {
            return true
        }

        const userID = req.payload.id
        const user = await this.userModel.findById(userID)
        if (!user) {
            const message = 'User not found. The requested resource could not be found.'
            throw new HttpException(message, HttpStatus.NOT_FOUND)
        }

        const expiryDate = user.subscriptionExpiryDate
        const currentDate = new Date()
        if (currentDate > expiryDate) {
            const message =
                'Subscription expired. Please renew subscription to continue accessing this resource.'
            throw new HttpException(message, HttpStatus.FORBIDDEN)
        }

        return true
    }

    async validateFile(endpoint: ServiceEndpoint, req: CustomRequest): Promise<boolean> {
        if (req.file) {
            return true
        }

        if (isNullOrUndefined(req.file) && !endpoint.textBased) {
            throw new HttpException(
                'Invalid request. Expected upload for non-text based service.',
                HttpStatus.BAD_REQUEST,
            )
        }

        return true
    }

    async validateFields(req: CustomRequest): Promise<boolean> {
        const service = await this.serviceModel.findOne({
            type: req.params['type'],
            version: req.params['version'],
        })
        if (!service) {
            const message = 'Service not found. The requested resource could not be found.'
            throw new HttpException(message, HttpStatus.NOT_FOUND)
        }

        const endpoint = await this.serviceEndpointModel
            .findOne({
                serviceID: service.id,
                task: req.params['task'],
            })
            .exec()
        if (!endpoint) {
            const message = 'Endpoint not found. The requested resource could not be found.'
            throw new HttpException(message, HttpStatus.NOT_FOUND)
        }

        if (!req.body['options'] && endpoint.options) {
            throw new HttpException(
                {
                    message: 'Options do not match pre-defined schema.',
                    expectedOptions: endpoint.options,
                },
                HttpStatus.BAD_REQUEST,
            )
        }

        if (!endpoint.options) {
            return this.validateFile(endpoint, req)
        }

        if (req.body['options']) {
            const options = req.body['options']
            const queryOptions = Object.keys(options)
            const endpointOptions = Object.keys(endpoint.options)
            if (
                queryOptions.length !== endpointOptions.length ||
                !queryOptions.every((key) => endpointOptions.includes(key))
            ) {
                throw new HttpException(
                    {
                        message: 'Options do not match pre-defined schema.',
                        expectedOptions: endpoint.options,
                    },
                    HttpStatus.BAD_REQUEST,
                )
            }

            for (const key of queryOptions) {
                const expectedType = endpoint.options[key]
                const valueType = typeof options[key]
                if (valueType !== expectedType) {
                    throw new HttpException(
                        {
                            message: `Invalid value type for option '${key}'. Expected '${expectedType}', but received '${valueType}'.`,
                            expectedOptions: endpoint.options,
                        },
                        HttpStatus.BAD_REQUEST,
                    )
                }
            }
        }
        return this.validateFile(endpoint, req)
    }
}

/**
 * * Performs query input validation for GET /usages
 * * 1. executionTime needs to be parsable to a number
 * * 2. startDate & endDateneeds to be parsable to a Date object
 * * 3. returnDelUser & returnDelService needs to be parsable to boolean values
 */
@Injectable()
export class RetrieveUsagesInterceptor implements NestInterceptor {
    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
        const req = context.switchToHttp().getRequest<CustomRequest>()
        const queries = req.query

        if (queries['executionTime']) {
            const execTime = +queries['executionTime']
            if (Number.isNaN(execTime)) {
                throw new HttpException(
                    `Invalid execution time format. Expected a parsable integer, but received '${typeof execTime}'.`,
                    HttpStatus.BAD_REQUEST,
                )
            }
        }

        if (queries['startDate']) {
            let startDate = queries['startDate'] as string
            if (!/^(\d{4}-\d{2}-\d{2})(T\d{2}:\d{2}:\d{2})?$/.test(startDate)) {
                const message =
                    'Invalid startDate format. Start date must be in YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS format.'
                throw new HttpException(message, HttpStatus.BAD_REQUEST)
            }

            if (!startDate.includes('T')) {
                startDate += 'T00:00:00'
            }

            if (Number.isNaN(new Date(startDate).getTime())) {
                const message = 'Invalid start date or time.'
                throw new HttpException(message, HttpStatus.BAD_REQUEST)
            }
        }

        if (queries['endDate']) {
            let endDate = queries['endDate'] as string
            if (!/^(\d{4}-\d{2}-\d{2})(T\d{2}:\d{2}:\d{2})?$/.test(endDate)) {
                const message =
                    'Invalid startDate format. End date must be in YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS format.'
                throw new HttpException(message, HttpStatus.BAD_REQUEST)
            }

            if (!endDate.includes('T')) {
                endDate += 'T23:59:59'
            }

            if (Number.isNaN(new Date(endDate).getTime())) {
                throw new HttpException('Invalid end date or time.', HttpStatus.BAD_REQUEST)
            }
        }

        if (queries['timezone']) {
            const timezone = parseFloat(queries['timezone'] as string)
            if (isNaN(timezone)) {
                const message = 'Invalid timezone. Timezone must be a valid integer.'
                throw new HttpException(message, HttpStatus.BAD_REQUEST)
            }
        }

        const booleanValues = ['true', 'false']
        if (queries['returnDelUser']) {
            const returnDelUser = queries['returnDelUser'] as string
            if (!booleanValues.includes(returnDelUser.toLowerCase())) {
                const message = `Invalid type for returnDelUser. Expected any of '${Object.values(
                    booleanValues,
                ).join(', ')}', but received '${returnDelUser}'.`
                throw new HttpException(message, HttpStatus.BAD_REQUEST)
            } else {
                req.query['returnDelUser'] = JSON.parse(returnDelUser.toLowerCase())
            }
        }

        if (queries['returnDelService']) {
            const returnDelService = queries['returnDelService'] as string
            if (!booleanValues.includes(returnDelService.toLowerCase())) {
                const message = `Invalid type for returnDelService. Expected any of '${Object.values(
                    booleanValues,
                ).join(', ')}', but received '${returnDelService}'.`
                throw new HttpException(message, HttpStatus.BAD_REQUEST)
            } else {
                req.query['returnDelService'] = JSON.parse(returnDelService.toLowerCase())
            }
        }

        return next.handle()
    }
}

/**
 * * Performs parameter validation for GET /usage/:uuid
 * * 1. User is forbidden to query a usage of other user if user is not admin
 */
@Injectable()
export class RetrieveUsageInterceptor implements NestInterceptor {
    constructor(@InjectModel('Query') private readonly queryModel: Model<Query>) {}

    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
        const req = context.switchToHttp().getRequest<CustomRequest>()
        const userID = req.payload['id']
        const role = req.payload['role']
        const uuid = req.params['uuid']
        const usage = await this.queryModel.findOne({ uuid: uuid })

        if (role === 'admin') {
            return next.handle()
        }

        if (!usage || usage.userID !== userID) {
            const message = 'Access denied. User is not authorized to access this resource.'
            throw new HttpException(message, HttpStatus.FORBIDDEN)
        }

        return next.handle()
    }
}
