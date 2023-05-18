import { Injectable, NestMiddleware, HttpStatus, HttpException } from '@nestjs/common';
import { Request, NextFunction } from 'express';
import mongoose from 'mongoose';
import { MissingFieldsMiddleware } from 'src/custom/custom.middleware';
import { CustomRequest } from 'src/custom/request/request.model';



@Injectable()
export class RegisterServiceMiddleware extends MissingFieldsMiddleware implements NestMiddleware {
    RegisterServiceMiddleware() {
        this.requiredFields = ['name', 'version', 'description', 'address', 
        'endpoints', 'config'];
    }

    use(req: CustomRequest, next: NextFunction) {
        this.checkMissingFields(req);
        return next();
    }
}

@Injectable()
export class RetrieveServiceMiddleware extends MissingFieldsMiddleware implements NestMiddleware {

    RetrieveServiceMiddleware() {
        this.requiredFields = ['id'];
    }

    use(req: CustomRequest, next: NextFunction) {
        if (! this.checkMissingFields(req)) {
            if (! mongoose.isValidObjectId(this.requiredFields[0])) {
                throw new HttpException("Invalid service ID format", HttpStatus.BAD_REQUEST)
            }
            return next();
        }
    }
}