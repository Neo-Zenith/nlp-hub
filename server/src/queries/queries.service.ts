import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Query } from "./queries.model";
import { Model } from "mongoose";
import axios from 'axios';
import { Service, ServiceEndpoint } from "../services/services.model";
import { Admin, User } from "../users/users.model";

@Injectable() 
export class QueryService {
    constructor(
        @InjectModel('Query') private readonly queryModel: Model<Query>,
        @InjectModel('Service') private readonly serviceModel: Model<Service>,
        @InjectModel('User') private readonly userModel: Model<User>,
        @InjectModel('Admin') private readonly adminModel: Model<Admin>,
        @InjectModel('ServiceEndpoint') private readonly serviceEndpointModel: Model<ServiceEndpoint>
    ) {}

    async serviceQuery(
        user: User, service: Service, endpoint: ServiceEndpoint, 
        options: Record<string, string>
    ) {
        const fullPath = service.baseAddress + endpoint.endpointPath;

        let response, config, elapsedTime;
        if (endpoint.method === 'POST') {
            config = {
                headers: {
                  'Content-Type': 'application/json',
                },
            };
            const start = performance.now();
            response = await axios.post(fullPath, options, config);
            const end = performance.now();
            elapsedTime = (end - start) / 1000;

        } else if (endpoint.method === 'GET') {
            const params = options;
            const start = performance.now();
            response = await axios.get(fullPath, { params })
            const end = performance.now();
            elapsedTime = (end - start) / 1000;
        }

        const serviceID = service.id;
        const endpointID = endpoint.id;
        const userID = user.id;
        const isAdminQuery = user.role === 'admin' ? true : false;
        const query = new this.queryModel({
            userID, serviceID, endpointID, output: JSON.stringify(response.data),
            options, executionTime: elapsedTime, isAdminQuery
        })
        
        await query.save();
        return { 
            uuid: query.uuid,
            executionTime: query.executionTime,
            output: response.data
        }
    }

    async getUsages(
        userID: string, role: string, type?: string, version?: string,
        execTime?: string, startDate?: string, endDate?: string, 
        returnDelUser?: boolean, returnDelService?: boolean
    ) {
        let usages;
        let query = {}

        if (execTime) {
            query['executionTime'] = { $lte: +execTime }
        }
        if (startDate) {
            const startDateTime = new Date(startDate);
            startDateTime.setUTCHours(0, 0, 0, 0); // Set time to 00:00:00
            query['dateTime'] = { $gte: startDateTime };
        }
          
        if (endDate) {
            const endDateTime = new Date(endDate);
            endDateTime.setUTCHours(23, 59, 59, 999); // Set time to 23:59:59
            if (query['dateTime']) {
                query['dateTime'].$lte = endDateTime;
            } else {
                query['dateTime'] = { $lte: endDateTime };
            }
        }

        if (role === 'admin') {
            usages = await this.queryModel.find(query).exec();
        } else {
            query['userID'] = userID;
            usages = await this.queryModel.find(query).exec();
        }
    
        const filteredUsages = await Promise.all(usages.map(async (usage) => {
            const service = await this.serviceModel.findById(usage.serviceID);
            var user;
            if (usage.isAdminQuery) {
                user = await this.adminModel.findById(usage.userID) 
            } else {
                user = await this.userModel.findById(usage.userID) 
            }

            var updates = {}
            if (service) {
                if (! (service.type === type && service.version === version)) {
                    return;
                }
            } else {
                if (returnDelService) {
                    updates['serviceDeleted'] = true;
                } else {
                    return;
                }
            }

            if (! user) {
                if (returnDelUser) {
                    updates['userDeleted'] = true;
                } else {
                    return;
                }
            } 
            return Object.assign(updates, usage['_doc']);;
        }));
        
        return filteredUsages.filter(Boolean);
    }

    async getUsage(uuid: string) {
        const usage = await this.queryModel.findOne({ uuid: uuid });
        if (! usage) {
            throw new HttpException("Usage not found", HttpStatus.NOT_FOUND);
        }
        const service = await this.serviceModel.findById(usage.serviceID);
        if (! service) {
            return Object.assign({ 'serviceDeleted': true }, usage['_doc']);
        }
        return usage;
    }

    async deleteUsage(uuid: string) {
        const usage = await this.queryModel.findOne({ uuid: uuid });
        if (! usage) {
            throw new HttpException("Usage not found", HttpStatus.NOT_FOUND);
        }
        await this.queryModel.deleteOne({ uuid: uuid })
        return { message: 'Usage deleted' }
    }

    async retrieveService(type: string, version: string) {
        const service = await this.serviceModel.findOne({ type: type, version: version });
        if (! service) {
            throw new HttpException("Service not found", HttpStatus.NOT_FOUND)
        }
        return service;
    }

    async retrieveEndpoint(serviceID: string, task: string) {
        const endpoint = await this.serviceEndpointModel.findOne({ serviceID: serviceID, task: task});
        if (! endpoint) {
            throw new HttpException("Endpoint not found", HttpStatus.NOT_FOUND);
        }
        return endpoint;
    }

    async retrieveUser(userID: string, role: string) {
        var user;
        if (role === 'admin') {
            user = await this.adminModel.findById(userID);
        } else {
            user = await this.userModel.findById(userID);
        }
        if (! user) {
            throw new HttpException("User not found", HttpStatus.NOT_FOUND);
        }
        return user;
    }
}