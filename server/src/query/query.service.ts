import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Query } from "./query.model";
import { Model } from "mongoose";
import { Nlp, NlpConfig, NlpEndpoint, NlpEndpointModel, NlpModel } from "src/nlp/nlp.model";

@Injectable() 
export class QueryService {
    constructor(
        @InjectModel('Query') private readonly queryModel: Model<Query>,
        @InjectModel('Nlp') private readonly nlpModel: Model<Nlp>,
        @InjectModel('NlpEndpoint') private readonly nlpEndpointModel: Model<NlpEndpoint>,
        @InjectModel('NlpConfig') private readonly nlpConfigModel: Model<NlpConfig>
    ) {}
    
    async serviceRequest(input: string, serviceID: string, config: string, options: Record<string, string>) {
        const endpointID = this.parseConfig(serviceID, config);
        const endpoint = (await this.nlpEndpointModel.findById(endpointID).exec()).toObject();
        const method = endpoint.method;
        const url = endpoint.url;

        const payload = {
            message: input,
            options: options
        }

        if (method === 'POST') {

        } else if (method === 'GET') {
            
        }
    }

    async retrieveConfig(serviceID: string) {
        const api = await this.nlpModel.findById(serviceID);
        if (!api) {
            return false;
        }

        const config = await this.nlpConfigModel.find({ serviceID: api.id })

        return config;
    }

    async parseConfig(serviceID: string, configTask: string) {
        const api = await this.nlpModel.findById(serviceID);
        if (!api) {
            return false;
        }

        const config = await this.nlpConfigModel.findOne({ serviceID: api.id, task: configTask })
        if (!config) {
            return false
        }
        return config.endpointID;
    }

    private async retrieveEndpoints(serviceID: string) {
        const api = await NlpModel.findById(serviceID);

        if (! api) {
            return false;
        }
        
        const endpoints = await NlpEndpointModel.find({serviceID: serviceID});
        return endpoints;
    }
}