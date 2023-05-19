import { Injectable, NestMiddleware, HttpStatus, HttpException } from '@nestjs/common';
import { NextFunction, query } from 'express';
import mongoose from 'mongoose';
import { MissingFieldsMiddleware } from 'src/custom/custom.middleware';
import { CustomRequest } from 'src/custom/request/request.model';
import { NlpEndpointModel } from 'src/nlp/nlp.model';

@Injectable()
export class RegisterQueryMiddleware extends MissingFieldsMiddleware implements NestMiddleware{
    constructor() {
        const requiredFields = ['serviceID', 'endpointID', 'options']
        super(requiredFields);
        this.requiredFields = requiredFields;
    }

    async use(req: CustomRequest, res: Response, next: NextFunction) {
        if (! this.checkMissingFields(req)) {
            if (! mongoose.isValidObjectId(req.body['serviceID'])) {
                throw new HttpException(
                    "Invalid service ID format", HttpStatus.BAD_REQUEST)
            }

            if (! mongoose.isValidObjectId(req.body['endpointID'])) {
                throw new HttpException(
                    "Invalid endpoint ID format", HttpStatus.BAD_REQUEST
                )
            }

            const legalFields = await validateField(req);
            if (legalFields) {
                return next();
            }
        }
    }
}


async function validateField(req: CustomRequest) {
    const queryOptions =  Object.keys(req.body['options']);
    const endpoint = (await NlpEndpointModel.findById(req.body['endpointID']).exec()).toJSON();
    const nlpEndpointOptions = Object.keys(endpoint.options);

    if (queryOptions.length !== nlpEndpointOptions.length) {
        throw new HttpException(
            "Options do not match pre-defined parameters", 
            HttpStatus.BAD_REQUEST);
    }

    for (const key of queryOptions) {
        if (!nlpEndpointOptions.includes(key)) {
            throw new HttpException(
                "Options do not match pre-defined parameters", 
                HttpStatus.BAD_REQUEST);
        }
    }
    return true;
}
