import { Injectable, NestMiddleware, HttpStatus, HttpException } from '@nestjs/common';
import { NextFunction } from 'express';
import { MissingFieldsMiddleware } from 'src/custom/custom.middleware';
import { CustomRequest } from 'src/custom/request/request.model';
import { MethodTypes, NlpTypes } from './nlp.model';
import { Debug } from 'src/custom/debug/debug';


@Injectable()
export class RegisterServiceMiddleware extends MissingFieldsMiddleware implements NestMiddleware {
    constructor() {
        const requiredFields = [
            'name', 'description', 'address', 'type', 'endpoints'
        ];
        super(requiredFields);
    }

    use(req: CustomRequest, res: Response, next: NextFunction) {
        this.checkMissingFields(req);
        if (validateServiceField(req)) {
            return next();
        }
    }
}


@Injectable()
export class UpdateServiceMiddleware implements NestMiddleware {
    use(req: CustomRequest, res: Response, next: NextFunction) {
        if (validateServiceField(req)) {
            return next();
        }
    }
}

@Injectable()
export class RegisterEndpointMiddleware extends MissingFieldsMiddleware implements NestMiddleware {
    constructor() {
        const requiredFields = 
            ['method', 'endpointPath', 'task']
        super(requiredFields);
    }
    
    use(req: CustomRequest, res: Response, next: NextFunction) {
        this.checkMissingFields(req)
        if (validateEndpointField(req)) {
            return next();
        }
    }
}

@Injectable()
export class UpdateEndpointMiddleware implements NestMiddleware {
    use(req: CustomRequest, res: Response, next: NextFunction) {
        if (validateEndpointField(req)) {
            return next();
        }
    }
}


function validateServiceField(req: CustomRequest) {
    if (req.body['endpoints']) {
        try {
            for (const endpoint of req.body['endpoints']) {
                if (typeof endpoint !== 'object' || 
                    ! ('endpointPath' in endpoint) ||
                    ! ('method' in endpoint) ||
                    ! ('options' in endpoint) ||
                    ! ('task' in endpoint)) {
                        throw new HttpException(
                            "Incomplete body (endpoints)", HttpStatus.BAD_REQUEST)
                    }
            }
        } catch (err) {
            Debug.devLog('validateServiceField', err);
            if (err.name === 'TypeError') {
                throw new HttpException('Invalid body (endpoints)', HttpStatus.BAD_REQUEST)
            }
        }
    }
    
    if (req.body['type'] && ! Object.values(NlpTypes).includes(req.body['type'])) {
        throw new HttpException("Invalid service type", HttpStatus.BAD_REQUEST)
    }

    if (req.body['version']) {
        const version = req.body['version']
        if (version[0] !== 'v') {
            throw new HttpException("Invalid version format. Version must follow v{id} format.", HttpStatus.BAD_REQUEST)
        } 
        if (version.substring(1).includes('.')) {
            throw new HttpException("Invalid version format. Version must follow v{id} format.", HttpStatus.BAD_REQUEST)
        }
        const versionNum = parseInt(version.substring(1))
        if (Number.isNaN(versionNum)) {
            throw new HttpException("Invalid version format. Version must follow v{id} format.", HttpStatus.BAD_REQUEST)
        }
    }
    
    return true;
}

function validateEndpointField(req: CustomRequest) {
    if (! Object.values(MethodTypes).includes(req.body['method'])) {
        throw new HttpException("Invalid method", HttpStatus.BAD_REQUEST)
    }
    return true;
}