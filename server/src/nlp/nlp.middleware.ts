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
export class RemoveServiceMiddleware extends MissingFieldsMiddleware implements NestMiddleware {
    constructor() {
        const requiredFields = ['type', 'version'];
        super(requiredFields);
    }

    use(req: CustomRequest, res: Response, next: NextFunction) {
        this.checkMissingFields(req)            
        return next();
    }
}


@Injectable()
export class UpdateServiceMiddleware extends MissingFieldsMiddleware implements NestMiddleware {
    constructor() {
        const requiredFields = ['oldType', 'oldVersion'];
        super(requiredFields);
    }

    use(req: CustomRequest, res: Response, next: NextFunction) {
        this.checkMissingFields(req)
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
export class UpdateEndpointMiddleware extends MissingFieldsMiddleware implements NestMiddleware {
    constructor() {
        const requiredFields = ['oldTask']
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
export class RemoveEndpointMiddleware extends MissingFieldsMiddleware implements NestMiddleware {
    constructor() {
        const requiredFields = ['task'];
        super(requiredFields);
    }

    use(req: CustomRequest, res: Response, next: NextFunction) {
        this.checkMissingFields(req)
        return next();
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
    
    if (req.body['newType'] && ! Object.values(NlpTypes).includes(req.body['newType'])) {
        throw new HttpException("Invalid service type", HttpStatus.BAD_REQUEST)
    }

    if (req.body['newVersion']) {
        const version = req.body['newVersion']
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