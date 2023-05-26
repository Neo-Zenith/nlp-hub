import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Query } from "./query.model";
import { Model } from "mongoose";
import axios from 'axios';
import { Nlp, NlpEndpoint } from "src/nlp/nlp.model";
import { User } from "src/users/user.model";

@Injectable() 
export class QueryService {
    constructor(
        @InjectModel('Query') private readonly queryModel: Model<Query>,
        @InjectModel('Nlp') private readonly nlpModel: Model<Nlp>,
        @InjectModel('User') private readonly userModel: Model<User>,
        @InjectModel('NlpEndpoint') private readonly nlpEndpointModel: Model<NlpEndpoint>
    ) {}

    async serviceQuery(
        user: User, service: Nlp, endpoint: NlpEndpoint, 
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
        const query = new this.queryModel({
            userID, serviceID, endpointID, output: JSON.stringify(response.data),
            options, executionTime: elapsedTime
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
        execTime?: string, startDate?: string, endDate?: string
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
            const service = await this.nlpModel.findById(usage.serviceID);
            if (type) {
                if (service && service.type === type && (!version || service.version === version)) {
                    return usage;
                }
            } else {
                if (!service) {
                    return Object.assign({ 'deleted': true }, usage['_doc']);
                } else if (!version || service.version === version) {
                    return usage;
                }
            }
        }));
    
        return filteredUsages.filter(Boolean);
    }

    async getUsage(uuid: string) {
        const usage = await this.queryModel.findOne({ uuid: uuid });
        if (! usage) {
            throw new HttpException("Usage not found", HttpStatus.NOT_FOUND);
        }
        const service = await this.nlpModel.findById(usage.serviceID);
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
        const service = await this.nlpModel.findOne({ type: type, version: version });
        if (! service) {
            throw new HttpException("Service not found", HttpStatus.NOT_FOUND)
        }
        return service;
    }

    async retrieveEndpoint(serviceID: string, task: string) {
        const endpoint = await this.nlpEndpointModel.findOne({ serviceID: serviceID, task: task});
        if (! endpoint) {
            throw new HttpException("Endpoint not found", HttpStatus.NOT_FOUND);
        }
        return endpoint;
    }

    async retrieveUser(userID: string) {
        const user = await this.userModel.findById(userID);
        if (! user) {
            throw new HttpException("User not found", HttpStatus.NOT_FOUND);
        }
        return user;
    }
}