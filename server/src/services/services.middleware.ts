import { Injectable, NestMiddleware } from '@nestjs/common'
import { NextFunction } from 'express'
import { ValidateRequestBodyMiddleware } from '../common/common.middleware'
import { CustomRequest } from '../common/request/request.model'

@Injectable()
export class CreateServiceMiddleware
    extends ValidateRequestBodyMiddleware
    implements NestMiddleware
{
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
        this.checkFields(req)
        return next()
    }
}

@Injectable()
export class UpdateServiceMiddleware
    extends ValidateRequestBodyMiddleware
    implements NestMiddleware
{
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
        this.checkFields(req)
        return next()
    }
}

@Injectable()
export class CreateEndpointMiddleare
    extends ValidateRequestBodyMiddleware
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
        this.checkFields(req)
    }
}

@Injectable()
export class UpdateEndpointMiddleware
    extends ValidateRequestBodyMiddleware
    implements NestMiddleware
{
    constructor() {
        const fields = {
            method: { type: 'string', required: false },
            endpointPath: { type: 'string', required: false },
            task: { type: 'string', required: false },
            options: { type: 'object', required: false },
            supportedFormats: { type: 'object', required: false },
        }
        super(fields)
    }

    use(req: CustomRequest, res: Response, next: NextFunction): void {
        this.checkFields(req)
        return next()
    }
}
