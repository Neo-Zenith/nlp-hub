import { 
    Injectable, NestInterceptor, ExecutionContext, CallHandler, 
    HttpStatus, HttpException 
} from '@nestjs/common';
import { CustomRequest } from '../common/request/request.model';
import { Service, ServiceEndpoint } from '../services/services.model';
import { User } from '../users/users.model';
import { Query } from './queries.model';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class RegisterQueryInterceptor implements NestInterceptor {
    constructor(
        @InjectModel('User') private readonly userModel: Model<User>,
        @InjectModel('Service') private readonly serviceModel: Model<Service>,
        @InjectModel('ServiceEndpoint') private readonly serviceEndpointModel: Model<ServiceEndpoint>
    ) {}
    async intercept(context: ExecutionContext, next: CallHandler) {
        const req = context.switchToHttp().getRequest<CustomRequest>();
        if (this.checkValidSubscription(req)) {
            const legalFields = await this.validateField(req);
            if (legalFields) {
                return next.handle();
            }
        }
    }

    async checkValidSubscription(req) {
        const role = req.payload.role;
        // admins can query services without subscription restriction
        if (role === 'admin') {
            return true;
        }
    
        const userID = req.payload.id;
        const user = await this.userModel.findById(userID);
      
        if (!user) {
            throw new HttpException(
                'User not found',
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

    async validateField(req: CustomRequest) {
        const query = req.body['options'];
        const queryOptions =  Object.keys(query);
        const service = await this.serviceModel.findOne({ 
            type: req.params['type'], version: req.params['version']
        })
        if (! service ) {
            throw new HttpException("Service not found", HttpStatus.NOT_FOUND)
        }
        const endpoint = (await this.serviceEndpointModel.findOne({ 
            serviceID: service.id, task: req.params['task'] }).exec()).toJSON();
        const nlpEndpointOptions = Object.keys(endpoint.options);
    
        if (queryOptions.length !== nlpEndpointOptions.length) {
            throw new HttpException({
                    message: "Options do not match pre-defined parameters",
                    options: endpoint.options
                }, HttpStatus.BAD_REQUEST
            );
        }
    
        for (const key of queryOptions) {
            if (!nlpEndpointOptions.includes(key)) {
                throw new HttpException({
                        message: "Options do not match pre-defined parameters",
                        options: endpoint.options
                    }, HttpStatus.BAD_REQUEST
                );
            }
    
            if (typeof query[key] !== endpoint.options[key]) {
                    throw new HttpException({
                        message: "Options do not match pre-defined parameters",
                        options: endpoint.options
                    }, HttpStatus.BAD_REQUEST
                );
            }
        }
        return true;
    }
}

@Injectable()
export class RetrieveUsagesInterceptor implements NestInterceptor {
    async intercept(context: ExecutionContext, next: CallHandler) {
        const req = context.switchToHttp().getRequest<CustomRequest>();
        const queries = req.query;
      
        if (queries['executionTime']) {
            const execTime = +queries['executionTime'];
            if (isNaN(execTime)) {
                throw new HttpException(
                    'Invalid executionTime format (Must be a number)',
                    HttpStatus.BAD_REQUEST
                );
            } 
        }
      
        if (queries['startDate'] && typeof queries['startDate'] === 'string') {
            const startDate = queries['startDate'];
            if (! /^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
                throw new HttpException(
                    'Invalid startDate format (Must be in YYYY-MM-DD format)',
                    HttpStatus.BAD_REQUEST
                );
            }
            if (isNaN(new Date(startDate).getTime())) {
                throw new HttpException(
                    "Invalid year, month (01 - 12), or date (01 - 31)",
                    HttpStatus.BAD_REQUEST
                )
            }
        }
      
        if (queries['endDate'] && typeof queries['endDate'] === 'string') {
            const endDate = queries['endDate'];
            if (!/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
                throw new HttpException(
                    'Invalid endDate format (Must be in YYYY-MM-DD format)',
                    HttpStatus.BAD_REQUEST
                );
            }
            if (isNaN(new Date(endDate).getTime())) {
                throw new HttpException(
                    "Invalid year, month (01 - 12), or date (01 - 31)",
                    HttpStatus.BAD_REQUEST
                )
            }
        }

        const booleanValues = ['true', 'false']
        if (queries['returnDelUser'] && typeof queries['returnDelUser'] === 'string') {
            if (! booleanValues.includes((queries['returnDelUser'].toLowerCase()))) {
                throw new HttpException(
                    "Invalid boolean value (true or false)",
                    HttpStatus.BAD_REQUEST
                )
            } else {
                req.query['returnDelUser'] = JSON.parse(queries['returnDelUser'].toLowerCase())
            }
        }

        if (queries['returnDelService'] && typeof queries['returnDelService'] === 'string') {
            if (! booleanValues.includes((queries['returnDelService'].toLowerCase()))) {
                throw new HttpException(
                    "Invalid boolean value (true or false)",
                    HttpStatus.BAD_REQUEST
                )
            } else {
                req.query['returnDelService'] = JSON.parse(queries['returnDelService'].toLowerCase())
            }
        }
      
        return next.handle();
    }
}

@Injectable()
export class RetrieveUsageInterceptor implements NestInterceptor {
    constructor(
        @InjectModel('Query') private readonly queryModel: Model<Query>
    ) {}

    async intercept(context: ExecutionContext, next: CallHandler) {
        const req = context.switchToHttp().getRequest<CustomRequest>();
        const userID = req.payload['id'];
        const role = req.payload['role']
        const uuid = req.params['uuid'];
        const usage = await this.queryModel.findOne({ uuid: uuid })

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


