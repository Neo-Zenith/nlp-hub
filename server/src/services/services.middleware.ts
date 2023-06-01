import { Injectable, NestMiddleware, HttpStatus, HttpException } from '@nestjs/common'
import { NextFunction } from 'express'
import { ValidateRequestMiddleware } from 'src/common/common.middleware'
import { CustomRequest } from 'src/common/request/request.model'
import { HttpMethodType, ServiceEndpointSchema, ServiceType, UploadFormat } from './services.model'

@Injectable()
export class RegisterServiceMiddleware extends ValidateRequestMiddleware implements NestMiddleware {
    constructor() {
        const fields = {
            name: { type: 'string', required: true },
            description: { type: 'string', required: true },
            address: { type: 'string', required: true },
            type: { type: 'string', required: true },
            endpoints: { type: 'object', required: true },
        }
        super(fields)
    }

    use(req: CustomRequest, res: Response, next: NextFunction): void {
        this.hasInvalidFields(req)
        if (validateServiceFields(req)) {
            return next()
        }
    }
}

@Injectable()
export class UpdateServiceMiddleware extends ValidateRequestMiddleware implements NestMiddleware {
    constructor() {
        const fields = {
            name: { type: 'string', required: false },
            version: { type: 'string', required: false },
            description: { type: 'string', required: false },
            address: { type: 'string', required: false },
            type: { type: 'string', required: false },
        }
        super(fields)
    }

    use(req: CustomRequest, res: Response, next: NextFunction): void {
        if (validateServiceFields(req)) {
            return next()
        }
    }
}

@Injectable()
export class RegisterEndpointMiddleware
    extends ValidateRequestMiddleware
    implements NestMiddleware
{
    constructor() {
        const fields = {
            method: { type: 'string', required: true },
            endpointPath: { type: 'string', required: true },
            task: { type: 'string', required: true },
            textBased: { type: 'boolean', required: false },
            options: { type: 'object', required: false },
            supportedFormats: { type: 'object', required: false },
        }
        super(fields)
    }

    use(req: CustomRequest, res: Response, next: NextFunction): void {
        this.hasInvalidFields(req)
        if (validateEndpointFields(req)) {
            return next()
        }
    }
}

@Injectable()
export class UpdateEndpointMiddleware extends ValidateRequestMiddleware implements NestMiddleware {
    constructor() {
        const fields = {
            method: { type: 'string', required: false },
            endpointPath: { type: 'string', required: false },
            task: { type: 'string', required: false },
            options: { type: 'object', required: false },
        }
        super(fields)
    }

    use(req: CustomRequest, res: Response, next: NextFunction): void {
        if (validateEndpointFields(req)) {
            return next()
        }
    }
}

function validateServiceFields(req: CustomRequest): boolean {
    if (req.body['endpoints']) {
        const endpoints = req.body['endpoints']
        for (const endpoint of endpoints) {
            if (
                typeof endpoint !== 'object' ||
                typeof endpoint.endpointPath !== 'string' ||
                typeof endpoint.method !== 'string' ||
                (endpoint.options && typeof endpoint.options !== 'object') ||
                typeof endpoint.task !== 'string' ||
                !Object.values(HttpMethodType).includes(endpoint.method as HttpMethodType)
            ) {
                const message =
                    'Invalid body. Expected an endpoint to follow the pre-defined schema.'
                const schema = ServiceEndpointSchema
                const attributes = {}
                for (const attribute in schema['obj']) {
                    if (schema['obj'][attribute].type.name) {
                        attributes[attribute] = {
                            type: schema['obj'][attribute].type.name.toLowerCase(),
                            required: schema['obj'][attribute].required,
                        }
                    }
                }

                throw new HttpException(
                    {
                        message: message,
                        schema: attributes,
                    },
                    HttpStatus.BAD_REQUEST,
                )
            }

            if (
                endpoint.supportedFormats &&
                (typeof endpoint.supportedFormats !== 'object' ||
                    !endpoint.supportedFormats.every((format) =>
                        Object.values(UploadFormat).includes(format),
                    ))
            ) {
                const message = `Expected supported format to be an array consisting any of '${Object.values(
                    UploadFormat,
                ).join(', ')}', but received '${Object.values(endpoint.supportedFormats).join(
                    ', ',
                )}'.`
                throw new HttpException(
                    {
                        message: message,
                    },
                    HttpStatus.BAD_REQUEST,
                )
            }
        }
    }

    if (req.body['type'] && !Object.values(ServiceType).includes(req.body['type'])) {
        const message = `Invalid service type. Expected any of '${Object.values(ServiceType).join(
            ', ',
        )}', but received '${req.body['type']}'.`
        throw new HttpException(message, HttpStatus.BAD_REQUEST)
    }

    if (req.body['version']) {
        const version = req.body['version']
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
    }

    return true
}

function validateEndpointFields(req: CustomRequest): boolean {
    if (req.body['method'] && !Object.values(HttpMethodType).includes(req.body['method'])) {
        const message = `Invalid HTTP method. Expected any of '${Object.values(HttpMethodType).join(
            ', ',
        )}, but received '${req.body['method']}'.`
        throw new HttpException(message, HttpStatus.BAD_REQUEST)
    }

    if (
        req.body['supportedFormats'] &&
        typeof req.body['supportedFormats'] !== 'object' &&
        req.body['supportedFormats'].every((format) => Object.values(UploadFormat).includes(format))
    ) {
        const message = `Expected supported format to be an array consisting any of '${Object.values(
            UploadFormat,
        ).join(', ')}', but received '${Object.values(req.body['supportedFormats'].join(', '))}'.`
        throw new HttpException(
            {
                message: message,
            },
            HttpStatus.BAD_REQUEST,
        )
    }
    return true
}
