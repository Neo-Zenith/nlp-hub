import { HttpException, HttpStatus, Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction } from "express";
import mongoose from "mongoose";
import { MissingFieldsMiddleware } from "src/custom/custom.middleware";
import { CustomRequest } from "src/custom/request/request.model";
import { NlpEndpointModel } from "src/nlp/nlp.model";


@Injectable()
export class RegisterUsageMiddleware extends MissingFieldsMiddleware implements NestMiddleware {
    constructor() {
        const requiredFields = ['serviceID', 'input', 'output', 'options', 'endpointID']
        super(requiredFields);
        this.requiredFields = requiredFields;
    }

    async use(req: CustomRequest, res: Response, next: NextFunction) {
        if (! this.checkMissingFields(req)) {
            var requestBody;
            if (req.method === 'POST') {
                requestBody = req.body;
            } else if (req.method === 'GET') {
                requestBody = req.params;
            }

            if (! mongoose.isValidObjectId(requestBody['serviceID'])) {
                throw new HttpException("Invalid service ID format", HttpStatus.BAD_REQUEST)
            }
            if (! mongoose.isValidObjectId(requestBody['endpointID'])) {
                throw new HttpException("Invalid endpoint ID format", HttpStatus.BAD_REQUEST)
            }
            const legalFields = await validateField(req);
            if (legalFields) {
                return next();
            }
        }
    }
}


@Injectable()
export class RetrieveUsageMiddleware extends MissingFieldsMiddleware implements NestMiddleware {

    constructor() {
        const requiredFields = ['id']
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
                throw new HttpException("Invalid usage ID format", HttpStatus.BAD_REQUEST)
            }
            return next();
        }
    }
}


async function validateField(req: CustomRequest) {
    const queryOptions = Object.keys(req.body['options']);
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