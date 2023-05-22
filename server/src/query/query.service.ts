import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Query } from "./query.model";
import { Model } from "mongoose";
import axios from 'axios';
import { Nlp, NlpEndpoint, NlpEndpointModel, NlpModel } from "src/nlp/nlp.model";

@Injectable() 
export class QueryService {
    constructor(
        @InjectModel('Query') private readonly queryModel: Model<Query>,
        @InjectModel('Nlp') private readonly nlpModel: Model<Nlp>,
        @InjectModel('NlpEndpoint') private readonly nlpEndpointModel: Model<NlpEndpoint>
    ) {}

    async serviceQuery(userID: string,
                        serviceID: string, 
                        endpointID: string, 
                        options: Record<string, string>) {
        
        const service = await this.retrieveService(serviceID);
        const endpoint = await this.retrieveEndpoint(endpointID);
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

        const query = new this.queryModel({
            userID,
            serviceID,
            endpointID,
            output: JSON.stringify(response.data),
            options
        })
        
        await query.save();
        return { 
            id: query.id,
            output: response.data
        }
    }

    async getAllUsageForUser(userID: string, type?: string) {
        const usages = await this.queryModel.find({userID: userID});
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

    async getAllUsageForAdmin(type?: string) {
        const usages = await this.queryModel.find();
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
                }
            }
        }));

        return filteredUsages.filter(Boolean);
    }

    private async retrieveService(serviceID: string) {
        const service = await this.nlpModel.findById(serviceID);
        if (! service) {
            throw new HttpException("Service not found", HttpStatus.NOT_FOUND)
        }
        return service;
    }

    private async retrieveEndpoint(endpointID: string) {
        const endpoint = await this.nlpEndpointModel.findById(endpointID);
        if (! endpoint) {
            throw new HttpException("Endpoint not found", HttpStatus.NOT_FOUND);
        }
        return endpoint;
    }
}