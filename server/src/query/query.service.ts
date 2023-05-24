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

        let response, config;
        if (endpoint.method === 'POST') {
            config = {
                headers: {
                  'Content-Type': 'application/json',
                },
            };
            response = await axios.post(fullPath, options, config);

        } else if (endpoint.method === 'GET') {
            const params = options;
            response = await axios.get(fullPath, { params })
        }

        const serviceID = service.id;
        const endpointID = endpoint.id;
        const userID = user.id;
        const query = new this.queryModel({
            userID, serviceID, endpointID, output: JSON.stringify(response.data),
            options
        })
        
        await query.save();
        return { 
            id: query.id,
            output: response.data
        }
    }

    async getUsages(userID: string, role: string, type?: string) {
        var usages;
        if (role === 'admin') {
            usages = await this.queryModel.find().exec();
        } else {
            usages = await this.queryModel.find({ userID: userID });
        }
    
        const filteredUsages = await Promise.all(usages.map(async (usage) => {
            const service = await this.nlpModel.findById(usage.serviceID); 
            if (type) {
                if (service && service.type === type) {
                    return usage;
                }
            }
            else {
                if (! service) {
                    return Object.assign({'deleted': true}, usage['_doc'] )
                } else {
                    return usage;
                }
            }
        }));

        return filteredUsages.filter(Boolean);
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
        const user = await this.userModel.findById({ userID });
        if (! user) {
            throw new HttpException("User not found", HttpStatus.NOT_FOUND);
        }
        return user;
    }
}