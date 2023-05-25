import { Injectable, NestInterceptor, ExecutionContext, CallHandler, HttpStatus, HttpException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { CustomRequest } from 'src/custom/request/request.model';
import { NlpEndpointModel, NlpModel } from 'src/nlp/nlp.model';
import { UserModel } from 'src/users/user.model';
import { QueryModel } from './query.model';

@Injectable()
export class RegisterQueryInterceptor implements NestInterceptor {
    async intercept(context: ExecutionContext, next: CallHandler) {
        const req = context.switchToHttp().getRequest<CustomRequest>();
        if (checkValidSubscription(req)) {
            const legalFields = await validateField(req);
            if (legalFields) {
                return next.handle();
            }
        }
    }
}

@Injectable()
export class RetrieveUsageInterceptor implements NestInterceptor {
    async intercept(context: ExecutionContext, next: CallHandler) {
        const req = context.switchToHttp().getRequest<CustomRequest>();
        const userID = req.payload['id'];
        const role = req.payload['role']
        const uuid = req.params['uuid'];
        const usage = await QueryModel.findOne({ uuid: uuid })

        if (! usage) {
            throw new HttpException("Usage not found", HttpStatus.NOT_FOUND);
        }

        if (usage.userID === userID || role === 'admin') {
            return next.handle();
        } else {
            throw new HttpException("User not authorized", HttpStatus.FORBIDDEN)
        }
    }
}


async function validateField(req: CustomRequest) {
    const queryOptions =  Object.keys(req.body['options']);
    const service = await NlpModel.findOne({ 
        type: req.params['type'], version: req.params['version']
    })
    if (! service ) {
        throw new HttpException("Service not found", HttpStatus.NOT_FOUND)
    }
    const endpoint = (await NlpEndpointModel.findOne({ 
        serviceID: service.id, task: req.params['task'] }).exec()).toJSON();
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

async function checkValidSubscription(req) {
    const userID = req.payload.id;
    const user = await UserModel.findById(userID);
  
    if (!user) {
        throw new HttpException(
            'The requested user could not be found',
            HttpStatus.NOT_FOUND
        );
    }
  
    const expiryDate = user.subscriptionExpiryDate;
    const currentDate = new Date();
  
    if (currentDate > expiryDate) {
        throw new HttpException('Subscription expired.', HttpStatus.UNAUTHORIZED);
    }

    return true;
}