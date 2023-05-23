import { Injectable, NestMiddleware, HttpStatus, HttpException } from '@nestjs/common';
import { NextFunction } from 'express';
import mongoose from 'mongoose';
import { MissingFieldsMiddleware } from 'src/custom/custom.middleware';
import { CustomRequest } from 'src/custom/request/request.model';
import { MethodTypes, NlpTypes } from './nlp.model';
import { Debug } from 'src/custom/debug/debug';
import { httpExceptionSchema } from 'src/custom/custom.schema';


@Injectable()
export class RegisterServiceMiddleware extends MissingFieldsMiddleware implements NestMiddleware {
    constructor() {
        const requiredFields = ['name', 'version', 'description', 'address', 'type',
        'endpoints'];
        super(requiredFields);
        this.requiredFields = requiredFields;
    }

    use(req: CustomRequest, res: Response, next: NextFunction) {
        this.checkMissingFields(req);
        if (validateServiceField(req)) {
            return next();
        }
    }
}

@Injectable()
export class RetrieveServiceMiddleware extends MissingFieldsMiddleware implements NestMiddleware {
    constructor() {
        const requiredFields = ['id'];
        super(requiredFields);
        this.requiredFields = requiredFields;
    }

    use(req: CustomRequest, res: Response, next: NextFunction) {
        if (! this.checkMissingFields(req)) {
            var requestBody;
            if (req.method === 'POST') {
                requestBody = req.body;
            } else if (req.method === 'GET') {
                requestBody = req.params;
            }

            if (! mongoose.isValidObjectId(requestBody['id'])) {
                throw new HttpException("Invalid service ID format", HttpStatus.BAD_REQUEST)
            }
            
            return next();
        }
    }
}


@Injectable()
export class UpdateServiceMiddleware extends MissingFieldsMiddleware implements NestMiddleware {
    constructor() {
        const requiredFields = ['id'];
        super(requiredFields);
        this.requiredFields = requiredFields;
    }

    use(req: CustomRequest, res: Response, next: NextFunction) {
        if(! this.checkMissingFields(req)) {
            if (! mongoose.isValidObjectId(req.body['id'])) {
                throw new HttpException("Invalid service ID format", HttpStatus.BAD_REQUEST)
            }

            if (validateServiceField(req)) {
                return next();
            }
        }
    }
}


@Injectable()
export class RetrieveEndpointMiddleware extends MissingFieldsMiddleware implements NestMiddleware {
    constructor() {
        const requiredFields = ['id'];
        super(requiredFields);
        this.requiredFields = requiredFields;
    }

    use(req: CustomRequest, res: Response, next: NextFunction) {
        if (! this.checkMissingFields(req)) {
            var requestBody;
            if (req.method === 'POST') {
                requestBody = req.body;
            } else if (req.method === 'GET') {
                requestBody = req.params;
            }

            if (! mongoose.isValidObjectId(requestBody['id'])) {
                throw new HttpException("Invalid endpoint ID format", HttpStatus.BAD_REQUEST)
            }
            
            return next();
        }
    }
}

@Injectable()
export class RegisterEndpointMiddleware extends MissingFieldsMiddleware implements NestMiddleware {
    constructor() {
        const requiredFields = 
            ['serviceID', 'method', 'options', 'endpointPath', 'task']
        super(requiredFields);
        this.requiredFields = requiredFields
    }
    
    use(req: CustomRequest, res: Response, next: NextFunction) {
        if (! this.checkMissingFields(req)) {
            if (! mongoose.isValidObjectId(req.body['serviceID'])) {
                throw new HttpException("Invalid service ID format", HttpStatus.BAD_REQUEST)
            }

            if (validateEndpointField(req)) {
                return next();
            }
        }
    }
}

@Injectable()
export class UpdateEndpointMiddleware extends MissingFieldsMiddleware implements NestMiddleware {
    constructor() {
        const requiredFields = ['id']
        super(requiredFields);
        this.requiredFields = requiredFields;
    }

    use(req: CustomRequest, res: Response, next: NextFunction) {
        if(! this.checkMissingFields(req)) {
            if (! mongoose.isValidObjectId(req.body['id'])) {
                throw new HttpException("Invalid endpoint ID format", HttpStatus.BAD_REQUEST)
            }
            if (! mongoose.isValidObjectId(req.body['serviceID'])) {
                throw new HttpException("Invalid service ID format", HttpStatus.BAD_REQUEST)
            }
            if (validateEndpointField(req)) {
                return next();
            }
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

    if (req.body['method'] && ! Object.values(MethodTypes).includes(req.body['method'])) {
        throw new HttpException("Invalid method", HttpStatus.BAD_REQUEST)
    }
    
    return true;
}

function validateEndpointField(req: CustomRequest) {
    if (! Object.values(MethodTypes).includes(req.body['method'])) {
        throw new HttpException("Invalid method", HttpStatus.BAD_REQUEST)
    }
    return true;
}