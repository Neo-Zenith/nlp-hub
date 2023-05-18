import { Injectable, NestMiddleware, HttpStatus, HttpException } from '@nestjs/common';
import { NextFunction } from 'express';
import mongoose from 'mongoose';
import { MissingFieldsMiddleware } from 'src/custom/custom.middleware';
import { CustomRequest } from 'src/custom/request/request.model';


@Injectable()
export class RegisterServiceMiddleware extends MissingFieldsMiddleware implements NestMiddleware {
    constructor() {
        const requiredFields = ['name', 'version', 'description', 'address', 
        'endpoints'];
        super(requiredFields);
        this.requiredFields = requiredFields;
    }

    use(req: CustomRequest, res: Response, next: NextFunction) {
        this.checkMissingFields(req);
        if (validateField(req)) {
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
            if (! mongoose.isValidObjectId(req.body['id'])) {
                throw new HttpException("Invalid service ID format", HttpStatus.BAD_REQUEST)
            }
            return next();
        }
    }
}


@Injectable()
export class UpdateServiceMiddleware extends MissingFieldsMiddleware implements NestMiddleware {
    constructor() {
        const requiredFields = ['id', 'name', 'version', 'description', 'address', 
        'endpoints'];
        super(requiredFields);
        this.requiredFields = requiredFields;
    }

    use(req: CustomRequest, res: Response, next: NextFunction) {
        if(! this.checkMissingFields(req)) {
            if (! mongoose.isValidObjectId(req.body['id'])) {
                throw new HttpException("Invalid service ID format", HttpStatus.BAD_REQUEST)
            }
            if (validateField(req)) {
                return next();
            }
        }
    }
}


function validateField(req: CustomRequest) {
    for (const endpoint of req.body['endpoints']) {
        if (typeof endpoint !== 'object' || 
            ! ('endpoint' in endpoint) ||
            ! ('method' in endpoint) ||
            ! ('options' in endpoint) ||
            ! ('task' in endpoint)) {
                throw new HttpException(
                    "Incomplete body (endpoint)", HttpStatus.BAD_REQUEST)
            }
    }
    return true;
}