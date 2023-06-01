import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
    HttpException,
    HttpStatus,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import {
    HttpMethodType,
    ServiceEndpoint,
    ServiceEndpointSchema,
    ServiceType,
    UploadFormat,
} from './services.model'
import { isNullOrUndefined } from '@typegoose/typegoose/lib/internal/utils'
import { CustomRequest } from 'src/common/request/request.model'

class ServiceEndpointValidator {
    public static isValidEndpointPath(endpoint: Record<string, any>) {
        if (!endpoint.endpointPath) {
            const message =
                "Invalid endpoint path. Expected all endpoints to contain an 'endpointPath'."
            throw new HttpException(message, HttpStatus.BAD_REQUEST)
        } else if (typeof endpoint.endpointPath !== 'string') {
            const message = `Invalid endpointPath format. Expected 'string', but received '${typeof endpoint.endpointPath}'.`
            throw new HttpException(message, HttpStatus.BAD_REQUEST)
        } else if (!endpoint.endpointPath.startsWith('/')) {
            const message = `Invalid endpointPath format. Expected a trailing '/' for endpoint path '${endpoint.endpointPath}'.`
            throw new HttpException(message, HttpStatus.BAD_REQUEST)
        }
        return true
    }

    public static isValidMethod(endpoint: Record<string, any>): boolean {
        if (!endpoint.method) {
            const message = "Invalid endpoint method. Expected all endpoints to contain a 'method'."
            throw new HttpException(message, HttpStatus.BAD_REQUEST)
        } else if (typeof endpoint.method !== 'string') {
            const message = `Invalid method format. Expected 'string', but received '${typeof endpoint.method}'.`
            throw new HttpException(message, HttpStatus.BAD_REQUEST)
        } else if (!Object.values(HttpMethodType).includes(endpoint.method as HttpMethodType)) {
            const message = `Invalid method type. Expected any of '${Object.values(
                HttpMethodType,
            ).join(', ')}, but received ${endpoint.method}'.`
            throw new HttpException(message, HttpStatus.BAD_REQUEST)
        }
        return true
    }

    public static isValidTask(endpoint: Record<string, any>): boolean {
        if (!endpoint.task) {
            const message = "Invalid endpoint task. Expected all endpoints to contain a 'task'."
            throw new HttpException(message, HttpStatus.BAD_REQUEST)
        } else if (typeof endpoint.task !== 'string') {
            const message = `Invalid task format. Expected 'string', but received '${typeof endpoint.method}'.`
            throw new HttpException(message, HttpStatus.BAD_REQUEST)
        }
        return true
    }

    public static isValidOptions(endpoint: Record<string, any>): boolean {
        if (endpoint.options && typeof endpoint.options !== 'object') {
            const message = `Invalid options format. Expected 'object', but received '${typeof endpoint.method}'.`
            throw new HttpException(message, HttpStatus.BAD_REQUEST)
        }
        return true
    }

    public static isValidSupportedFormats(endpoint: Record<string, any>): boolean {
        if (endpoint.supportedFormats && !Array.isArray(endpoint.supportedFormats)) {
            const message = 'Invalid supportedFormats. Expected an array of supported formats.'
            throw new HttpException(message, HttpStatus.BAD_REQUEST)
        } else if (
            !endpoint.supportedFormats.every((format) =>
                Object.values(UploadFormat).includes(format as UploadFormat),
            )
        ) {
            const message = `Expected supported format to be an array consisting any of '${Object.values(
                UploadFormat,
            ).join(', ')}', but received '${Object.values(endpoint.supportedFormats).join(', ')}'.`
            throw new HttpException(message, HttpStatus.BAD_REQUEST)
        }
        return true
    }

    public static isValidEndpoint(endpoint: Record<string, any>): boolean {
        if (typeof endpoint !== 'object') {
            const message = `Invalid endpoint. Expected endpoint to follow the pre-defined schema.`
            const schema = ServiceEndpointSchema
            throw new HttpException({ message: message, schema: schema }, HttpStatus.BAD_REQUEST)
        }

        this.isValidEndpointPath(endpoint)
        this.isValidMethod(endpoint)
        this.isValidTask(endpoint)

        if (endpoint.textBased || isNullOrUndefined(endpoint.textBased)) {
            this.isValidOptions(endpoint)
        } else {
            this.isValidSupportedFormats(endpoint)
        }

        return true
    }
}

class ServiceValidator {
    public static isValidEndpoints(req: CustomRequest): boolean {
        const { endpoints } = req.body
        if (!Array.isArray(endpoints)) {
            const message = 'Invalid endpoints. Expected an array of endpoints.'
            throw new HttpException(message, HttpStatus.BAD_REQUEST)
        }

        if (endpoints.length <= 0) {
            const message = `Invalid endpoints. Expected at least 1 endpoint, but received ${endpoints.length}.`
            throw new HttpException(message, HttpStatus.BAD_REQUEST)
        }

        for (const endpoint of endpoints) {
            ServiceEndpointValidator.isValidEndpoint(endpoint)
        }

        return true
    }

    public static isValidType(req: CustomRequest): boolean {
        const { type } = req.body
        if (!Object.values(ServiceType).includes(type)) {
            const message = `Invalid service type. Expected any of '${Object.values(
                ServiceType,
            ).join(', ')}', but received '${type}'.`
            throw new HttpException(message, HttpStatus.BAD_REQUEST)
        }
        return true
    }

    public static isValidAddress(req: CustomRequest): boolean {
        const { address } = req.body
        const urlRegex = /^(?!.*\/$)(?:[a-zA-Z]+:\/\/)?[^\s]+$/
        if (!urlRegex.test(address)) {
            const message = `Invalid URL. Expected a valid address and should not end with a '/'.`
            throw new HttpException(message, HttpStatus.BAD_REQUEST)
        }
        return true
    }

    public static isValidVersion(req: CustomRequest): boolean {
        const { version } = req.body
        if (version[0] !== 'v') {
            const message = 'Invalid version format. Version must follow v{id} format.'
            throw new HttpException(message, HttpStatus.BAD_REQUEST)
        }
        if (version.substring(1).includes('.')) {
            const message = `Invalid version format. Expected a non-negative integer after 'v', but received '${version.substring(
                1,
            )}'.`
            throw new HttpException(message, HttpStatus.BAD_REQUEST)
        }
        const versionNum = parseInt(version.substring(1))
        if (Number.isNaN(versionNum) || versionNum <= 0) {
            const message = `Invalid version format. Expected a non-negative integer after 'v', but received '${version.substring(
                1,
            )}'.`
            throw new HttpException(message, HttpStatus.BAD_REQUEST)
        }
        return true
    }
}

@Injectable()
export class CreateServiceInterceptor implements NestInterceptor {
    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
        const req = context.switchToHttp().getRequest<CustomRequest>()
        ServiceValidator.isValidAddress(req)
        ServiceValidator.isValidEndpoints(req)
        ServiceValidator.isValidType(req)
        return next.handle()
    }
}

@Injectable()
export class UpdateServiceInterceptor implements NestInterceptor {
    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
        const req = context.switchToHttp().getRequest<CustomRequest>()

        if (req.body.address) {
            ServiceValidator.isValidAddress(req)
        }

        if (req.body.type) {
            ServiceValidator.isValidType(req)
        }

        if (req.body.version) {
            ServiceValidator.isValidVersion(req)
        }
        return next.handle()
    }
}

@Injectable()
export class CreateEndpointInterceptor implements NestInterceptor {
    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
        const req = context.switchToHttp().getRequest<CustomRequest>()
        ServiceEndpointValidator.isValidEndpoint(req.body)
        return next.handle()
    }
}

@Injectable()
export class UpdateEndpointInterceptor implements NestInterceptor {
    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
        const req = context.switchToHttp().getRequest<CustomRequest>()

        if (req.body.method) {
            ServiceEndpointValidator.isValidMethod(req.body)
        }
        if (req.body.task) {
            ServiceEndpointValidator.isValidTask(req.body)
        }
        if (req.body.endpointPath) {
            ServiceEndpointValidator.isValidEndpointPath(req.body)
        }
        if (req.body.options) {
            ServiceEndpointValidator.isValidOptions(req.body)
        }
        if (req.body.supportedFormats) {
            ServiceEndpointValidator.isValidSupportedFormats(req.body)
        }
        return next.handle()
    }
}
